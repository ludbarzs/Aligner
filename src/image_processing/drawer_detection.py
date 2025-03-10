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


def get_drawer_dimensions_px(corners: np.ndarray) -> tuple[float, float, float, float]:
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

    return np.array([top_px, right_px, bottom_px, left_px])


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

    return corrected_image, final_x_ratio, final_y_ratio


# For testing
def measure_object_in_drawer(
    corrected_image: np.ndarray, x_ratio: float, y_ratio: float
) -> None:
    windows_name = "Measure Objects"
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

                # Add .5% correctoin factor
                x_distance_mm = dx / x_ratio * 1.005
                y_distance_mm = dy / y_ratio * 1.005

                distance_mm = np.sqrt((x_distance_mm) ** 2 + (y_distance_mm) ** 2)

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


def find_inscribed_circle_diameter(
    image, contour: np.ndarray, x_ratio: float, y_ratio: float
) -> float:
    """
    Find the smallest inscribed circle within a coin contour and display its diameter in mm.

    Parameters:
    - image: The image to draw visualization on
    - contour: The contour of the coin
    - x_ratio: Pixel to mm ratio in the x direction
    - y_ratio: Pixel to mm ratio in the y direction

    Returns:
    - The diameter of the inscribed circle in mm
    """
    # Find the center of the contour
    M = cv.moments(contour)
    if M["m00"] == 0:
        return 0

    cx = int(M["m10"] / M["m00"])  # cx = (sum of x-coordinates) / area
    cy = int(M["m01"] / M["m00"])  # cy = (sum of y-coordinates) / area
    center = (cx, cy)

    # Calculate distance from center to each point on the contour
    min_distance = float("inf")
    for point in contour:
        x, y = point[0]
        # Calculate distance, accounting for potentially different x and y ratios
        x_dist = (x - cx) / x_ratio
        y_dist = (y - cy) / y_ratio
        distance = np.sqrt(x_dist**2 + y_dist**2)

        if distance < min_distance:
            min_distance = distance
            closest_point = (x, y)

    # Convert the minimum distance to pixels for visualization
    radius_px_x = min_distance * x_ratio
    radius_px_y = min_distance * y_ratio

    # For visualization purposes, use the average of x and y ratios
    avg_radius_px = (radius_px_x + radius_px_y) / 2

    # Calculate diameter in mm (already in mm since we divided by the ratios)
    diameter_mm = 2 * min_distance

    # For comparison, get the min enclosing circle
    (enclosing_x, enclosing_y), min_enclosing_radius = cv.minEnclosingCircle(contour)

    # Draw visualization
    cv.circle(image, center, 3, (0, 0, 255), -1)  # Red dot for center
    cv.circle(
        image, center, int(avg_radius_px), (0, 255, 0), 2
    )  # Green circle for inscribed circle
    cv.circle(
        image,
        (int(enclosing_x), int(enclosing_y)),
        int(min_enclosing_radius),
        (255, 0, 0),
        2,
    )  # Blue circle for enclosing circle

    # Draw line from center to closest point
    cv.line(
        image, center, closest_point, (255, 255, 0), 2
    )  # Yellow line showing radius

    # Add text with diameter information
    cv.putText(
        image,
        f"D: {diameter_mm:.2f} mm",
        (center[0] - 120, center[1] + int(avg_radius_px) + 30),
        cv.FONT_HERSHEY_SIMPLEX,
        0.7,
        (0, 255, 0),
        2,
    )

    return image


def draw_contour_line(
    image: np.ndarray, contour: np.ndarray, x_ratio: float, y_ratio: float
):
    cv.drawContours(image, [contour], -1, (0, 255, 0), 1)

    max_length = 0
    longest_line = None

    for i in range(len(contour)):
        for j in range(i + 1, len(contour)):
            point1 = tuple(contour[i][0])
            point2 = tuple(contour[j][0])

            dx = abs(point2[0] - point1[0])
            dy = abs(point2[1] - point1[1])

            # Add .5% correctoin factor
            x_distance_mm = dx / x_ratio
            y_distance_mm = dy / y_ratio

            distance_mm = np.sqrt((x_distance_mm) ** 2 + (y_distance_mm) ** 2)

            if distance_mm > max_length:
                max_length = distance_mm
                longest_line = (point1, point2)

    if longest_line:
        cv.line(image, longest_line[0], longest_line[1], (255, 0, 0), 1)

        # Display distance
        mid_point = (
            (longest_line[0][0] + longest_line[1][0]) // 2,
            (longest_line[0][1] + longest_line[1][1]) // 2,
        )
        cv.putText(
            image,
            f"{max_length:.1f} mm",
            mid_point,
            cv.FONT_HERSHEY_SIMPLEX,
            0.7,
            (255, 0, 0),
            2,
        )

    return image


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
