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


def find_px_to_mm_ratio(contour: np.ndarray, coin_diameter: float = 24.25) -> float:
    # Smalles circle that can fully enclose the contour
    (x, y), radius = cv.minEnclosingCircle(contour)

    diameter_px = 2 * radius

    pixel_to_mm_ratio = diameter_px / coin_diameter

    return pixel_to_mm_ratio
