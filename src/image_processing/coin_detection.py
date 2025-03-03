from typing import List, Optional

import cv2 as cv
import numpy as np


def calculate_circularity(contour: np.ndarray) -> float:
    """
    Circularity = (4 * pi * Area) / (Perimiter^2)
    """

    area = cv.contourArea(contour)
    perimeter = cv.arcLength(contour, True)

    if perimeter == 0:
        return 0

    circularity = (4 * np.pi * area) / (perimeter**2)

    return circularity


def detect_circles(
    countours: List[np.ndarray], min_circularity: float = 0.85
) -> Optional[List[np.ndarray]]:
    circles = []

    for contour in countours:
        circularity = calculate_circularity(contour)
        if circularity > min_circularity:
            circles.append(contour)

    return circles


def distance_to_top_left_corner(contour: np.ndarray) -> float:
    # Calculates the centroid (Center of Mass, average position of all points in the contour)
    M = cv.moments(contour)

    # Ignore contours with zero area
    if M["m00"] == 0:
        return -1

    cx = int(M["m10"] / M["m00"])  # cx = (sum of x-coordinates) / area
    cy = int(M["m01"] / M["m00"])  # cy = (sum of y-coordinates) / area

    # Calculate distance between two points |AB| = sqrt((x2 - x1)^2 + (y2 - y1)^2)
    target_x = 0
    target_y = 0

    distance = np.sqrt((cx - target_x) ** 2 + (cy - target_y) ** 2)

    return distance


def coin_top_left_corner(contours: List[np.ndarray]) -> np.ndarray:
    circles = detect_circles(contours)
    if not circles:
        return None

    min_circle = [distance_to_top_left_corner(circles[0]), circles[0]]
    for circle in circles[1:]:
        distance = distance_to_top_left_corner(circle)
        if min_circle[0] > distance:
            min_circle[0] = distance
            min_circle[1] = circle

    return min_circle[1]


def find_px_to_mm_ratio(
    image, contour: np.ndarray, coin_diameter: float = 23.25
) -> float:
    area_px = cv.contourArea(contour)
    radius_px = np.sqrt(area_px / np.pi)
    diameter_px = 2 * radius_px
    output(image.copy(), contour, radius_px)

    pixel_to_mm_ratio = diameter_px / coin_diameter

    return pixel_to_mm_ratio


def display_coin(image, contour, x_ratio, y_ratio, coin_diameter: float = 23.25):
    M = cv.moments(contour)
    if M["m00"] == 0:
        return 0
    cx = int(M["m10"] / M["m00"])  # cx = (sum of x-coordinates) / area
    cy = int(M["m01"] / M["m00"])  # cy = (sum of y-coordinates) / area
    center = (cx, cy)

    min_distance = float("inf")
    for point in contour:
        # Calculate distance between two points |AB| = sqrt((x2 - x1)^2 + (y2 - y1)^2)
        x, y = point[0]
        distance = np.sqrt((x - cx) ** 2 + (y - cy) ** 2)
        if distance < min_distance:
            min_distance = distance

    radius = int(min_distance)

    # Draw the new smaller circle
    cv.circle(image, center, radius, (255, 0, 0), 2)  # Blue circle, thickness 2

    # Calculate the diameter of the new circle in millimeters
    pixel_diameter = 2 * radius
    mm_diameter = (
        pixel_diameter / coin_diameter
    ) * coin_diameter  # Scale using the coin's diameter

    # Display the diameter in millimeters on the image
    text = f"Diameter: {mm_diameter:.2f} mm"
    cv.putText(
        image,
        text,
        (cx + radius + 10, cy),
        cv.FONT_HERSHEY_SIMPLEX,
        0.5,
        (255, 255, 255),
        1,
    )


def find_px_to_mm_ratio_2(
    image, contour: np.ndarray, coin_diameter: float = 23.25
) -> float:
    """Accounting for the side of the coin being in the image, so the minEnclosingCirlce would inclue that"""
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
        # Calculate distance between two points |AB| = sqrt((x2 - x1)^2 + (y2 - y1)^2)
        x, y = point[0]
        distance = np.sqrt((x - cx) ** 2 + (y - cy) ** 2)
        if distance < min_distance:
            min_distance = distance

    # Use this as the radius of the inscribed circle
    radius_px = min_distance
    diameter_px = 2 * radius_px

    # Calculate pixel to mm ratio
    pixel_to_mm_ratio = diameter_px / coin_diameter

    # For visualization
    (x, y), min_enclosing_radius = cv.minEnclosingCircle(contour)

    # Draw both circles for comparison
    cv.circle(image, center, 3, (0, 0, 255), -1)  # Red dot for center
    cv.circle(
        image, center, int(radius_px), (0, 255, 0), 2
    )  # Green circle for inscribed circle
    cv.circle(
        image, center, int(min_enclosing_radius), (255, 0, 0), 2
    )  # Blue circle for enclosing circle

    return pixel_to_mm_ratio


def output(image, contour, radius=None):
    (x, y), r = cv.minEnclosingCircle(contour)
    center = (int(x), int(y))
    i = 0
    if not radius:
        i = 255
        # Convert to integer values for drawing
        radius = int(r)

    # Draw the center dot
    cv.circle(image, center, 3, (0, 0, 255), -1)  # Red dot

    # Draw the radius line
    edge_point = (int(x + radius), int(y))  # Point on the circle's edge
    cv.line(image, center, edge_point, (255, 0, 0), 6)  # Blue line
    cv.line(image, center, (int(x - radius), int(y)), (255, 0, i), 6)  # Blue line
    cv.line(image, center, (int(x), int(y - radius)), (255, 0, i), 6)  # Blue line
    cv.line(image, center, (int(x), int(y + radius)), (255, 0, i), 6)  # Blue line

    cv.namedWindow("image", cv.WINDOW_NORMAL)
    cv.imshow("image", image)
    cv.moveWindow("image", 0, 0)
    cv.waitKey(0)
    cv.destroyAllWindows()
