from typing import Optional, Tuple

import cv2 as cv
import numpy as np

from image_processing.utils import *


def order_corners(corners: np.ndarray) -> tuple[float, float, float, float]:
    """Orders corners in: Left-Up, Right-up, Right-down, Left-down"""
    if corners.shape[0] != 4:
        raise ValueError(f"Expected 4 values, got {corners.shape[0]}")

    sums = np.zeros(4)
    diffs = np.zeros(4)

    i = 0
    for x, y in corners:
        sums[i] = x + y
        diffs[i] = x - y
        i += 1

    top_left_index = np.argmin(sums)
    bottom_right_index = np.argmax(sums)
    top_right_index = np.argmax(diffs)
    bottom_left_index = np.argmin(diffs)

    return np.array(
        [
            corners[top_left_index],
            corners[top_right_index],
            corners[bottom_right_index],
            corners[bottom_left_index],
        ]
    )


def select_drawer_corners(image: np.ndarray) -> Optional[np.ndarray]:
    """User input to select corners"""
    display_image = image.copy()
    corners = []
    window_name = "Select Corners"

    def click_event(event, x, y, flag, param):
        nonlocal corners, display_image

        if event == cv.EVENT_LBUTTONDOWN:
            corners.append((x, y))

            temp_img = image.copy()

            for i, (px, py) in enumerate(corners):
                cv.circle(temp_img, (px, py), 3, (0, 255, 0), -1)

            cv.imshow(window_name, temp_img)

    cv.namedWindow(window_name, cv.WINDOW_NORMAL)
    cv.imshow(window_name, display_image)
    cv.moveWindow(window_name, 0, 0)

    cv.setMouseCallback(window_name, click_event)

    while len(corners) < 4:
        key = cv.waitKey(100)
        if key != -1:  # Any key
            break

    cv.destroyAllWindows()

    np_corners = np.array(corners)

    ordered_corners = order_corners(np_corners)

    return ordered_corners if ordered_corners.shape[0] == 4 else None


def get_drawer_dimensions_px(
    corners: np.ndarray, px_to_mm_ratio: float
) -> tuple[float, float, float, float]:
    """Returns: Up, Right, Down, Left-down"""

    # Corner px cordinates
    top_left = corners[0]
    top_right = corners[1]
    bottom_right = corners[2]
    bottom_left = corners[3]

    # Boundary px size
    top_px = np.linalg.norm(corners[1] - corners[0])
    bottom_px = np.linalg.norm(corners[2] - corners[3])
    right_px = np.linalg.norm(corners[2] - corners[1])
    left_px = np.linalg.norm(corners[3] - corners[0])

    # top_mm = top_px / px_to_mm_ratio
    # right_mm = right_px / px_to_mm_ratio
    # bottom_mm = bottom_px / px_to_mm_ratio
    # left_mm = left_px / px_to_mm_ratio

    return np.array([top_px, right_px, bottom_px, left_px])
    # return np.array([top_mm, right_mm, bottom_mm, left_mm])


def calculate_axis_ratios(
    corners: np.ndarray, real_width_mm: float, real_height_mm: float
) -> Tuple[float, float]:
    top_px = np.linalg.norm(corners[1] - corners[0])
    bottom_px = np.linalg.norm(corners[2] - corners[3])
    avg_with_px = (top_px + bottom_px) / 2

    right_px = np.linalg.norm(corners[2] - corners[1])
    left_px = np.linalg.norm(corners[3] - corners[0])
    avg_height_px = (right_px + left_px) / 2

    x_ratio = avg_with_px / real_width_mm
    y_ratio = avg_height_px / real_height_mm

    return x_ratio, y_ratio


def correct_perspective(
    image: np.ndarray, corners: np.ndarray, real_width_mm: float, real_height_mm: float
) -> tuple[np.ndarray, float]:
    x_ratio, y_ratio = calculate_axis_ratios(corners, real_width_mm, real_height_mm)

    target_width_px = int(real_width_mm * x_ratio)
    target_height_px = int(real_height_mm * y_ratio)

    # Destination points: Rectangle
    dst_points = np.array(
        [
            [0, 0],
            [target_width_px, 0],
            [target_width_px, target_height_px],
            [0, target_height_px],
        ],
        dtype=np.float32,
    )

    src_point = corners.astype(np.float32)

    perspective_matrix = cv.getPerspectiveTransform(src_point, dst_points)

    corrected_image = cv.warpPerspective(
        image, perspective_matrix, (target_width_px, target_height_px)
    )

    final_x_ratio = target_width_px / real_width_mm
    final_y_ratio = target_height_px / real_height_mm

    return corrected_image, (final_x_ratio, final_y_ratio)


def measure_object_in_drawer(
    corrected_image: np.ndarray, x_ratio: float, y_ratio: float
) -> None:
    measuring_image = corrected_image.copy()
    points = []

    def click_event(event, x, y, flag, param):
        nonlocal points, measuring_image

        if event == cv.EVENT_LBUTTONDOWN:
            points.append((x, y))
            cv.circle(measuring_image, (x, y), 3, (0, 0, 255), -1)

            if len(points) == 2:
                dx = abs(points[1][0] - points[0][0])
                dy = abs(points[1][1] - points[0][1])

                x_distance_mm = dx / x_ratio
                y_distance_mm = dy / y_ratio
                # Calculate distance
                distance_mm = np.sqrt((x_distance_mm) ** 2 + (y_distance_mm) ** 2)

                # Draw line
                cv.line(measuring_image, points[0], points[1], (0, 255, 0), 2)

                # Display distance
                mid_point = (
                    (points[0][0] + points[1][0]) // 2,
                    (points[0][1] + points[1][1]) // 2,
                )
                cv.putText(
                    measuring_image,
                    f"{distance_mm:.1f} mm",
                    mid_point,
                    cv.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (255, 0, 0),
                    2,
                )

                # Reset for new measurement
                points.clear()

            cv.imshow("Measure Objects", measuring_image)

    cv.namedWindow("Measure Objects", cv.WINDOW_NORMAL)
    cv.imshow("Measure Objects", measuring_image)
    cv.setMouseCallback("Measure Objects", click_event)

    cv.waitKey(0)
    cv.destroyAllWindows()


def view_drawer_boundaries(image: np.ndarray, corners: np.ndarray) -> None:
    for x, y in corners:
        cv.circle(image, (x, y), 3, (0, 255, 0), -1)

    for i in range(4):
        start_point = tuple(corners[i])

        next_index = (i + 1) if i < 3 else 0
        end_point = tuple(corners[next_index])

        cv.line(
            image, start_point, end_point, (0, 255, 0), 2
        )  # (image, start_point, end_point, color, thickness)

    cv.namedWindow("Drawer boundaries", cv.WINDOW_NORMAL)
    cv.imshow("Drawer boundaries", image)
    cv.waitKey(0)
    cv.destroyAllWindows()


# DEPRECATED
def detect_drawer_boundaries(
    image: np.ndarray,
    canny_low: int = 10,
    canny_high: int = 10,
    min_area_ratio: float = 0.5,
):
    gray_image = cv.cvtColor(image, cv.COLOR_BGR2GRAY)
    blurred_image = cv.GaussianBlur(gray_image, (7, 7), 0)
    edges_image = cv.Canny(blurred_image, canny_low, canny_high)

    kernel = cv.getStructuringElement(cv.MORPH_RECT, (11, 11))
    closed_edges = cv.morphologyEx(edges_image, cv.MORPH_CLOSE, kernel)

    contours, _ = cv.findContours(
        closed_edges, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE
    )

    # Get image dimensions (px)
    height, width = image.shape[:2]
    image_area = height * width

    for contour in contours:
        contour_area = cv.contourArea(contour)
        area_ratio = contour_area / image_area

        # Skip contours the area of which is not sufficient (50% by default)
        if area_ratio < min_area_ratio:
            continue

        # Approximates the contours as a poligon (Lines that can be straight are made straight)
        # Removes collinear poitns
        epsilon = 0.1 * cv.arcLength(
            contour, True
        )  # conour and boolean if contour is closed or not
        approx = cv.approxPolyDP(
            contour, epsilon, True
        )  # Straightens lines to the accuracy of epsilon

        view_image(image, approx)
        rect = cv.minAreaRect(contour)
        (w, h) = rect[1]  # Contains width and height
        aspect_ratio = max(w, h) / min(w, h)  # Get aspect ratio that is positive

        # Refine the contour with minAreaRect
        box = cv.boxPoints(rect)
        box = np.int0(box)
        view_image(image, box)
