from typing import (List, Optional)

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


def detect_circles(countours: List[np.ndarray], min_circularity: float = 0.85) -> List[np.ndarray]:
    """
    Filters contours to find circular shapes based on their circularity score.
    Circularity measures how close a contour is to a perfect circle (1.0 = perfect circle).
    """

    circles = []

    for contour in countours:
        circularity = calculate_circularity(contour)
        if circularity > min_circularity:
            circles.append(contour)

    return circles


def distance_to_top_left_corner(contour: np.ndarray) -> float:
    """
    Calculates contours distance to top left corner in pixles
    """
    # Calculates the centroid (Center of Mass, average position of all points in the contour)
    moments = cv.moments(contour)

    # Ignore contours with zero area
    if moments["m00"] == 0:
        return -1

    cx = int(moments["m10"] / moments["m00"])  # cx = (sum of x-coordinates) / area
    cy = int(moments["m01"] / moments["m00"])  # cy = (sum of y-coordinates) / area

    # Calculate distance between two points |AB| = sqrt((x2 - x1)^2 + (y2 - y1)^2)
    target_x = 0
    target_y = 0

    distance = np.sqrt((cx - target_x) ** 2 + (cy - target_y) ** 2)

    return distance


def coin_top_left_corner(contours: List[np.ndarray]) -> Optional[np.ndarray]:
    """Finds the circle that is closes to top left corner"""
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


def find_px_to_mm_ratio(image, contour: np.ndarray, coin_diameter: float = 23.25) -> float:
    """
    Deprecated: finds px_to_mm ratio using coin
    Devides pixel cound by real world length in mm
    """
    area_px = cv.contourArea(contour)
    radius_px = np.sqrt(area_px / np.pi)
    diameter_px = 2 * radius_px
    output(image.copy(), contour, radius_px)

    pixel_to_mm_ratio = diameter_px / coin_diameter

    return pixel_to_mm_ratio


def display_coin(image, contour, coin_diameter: float = 23.25) -> None:
    """
    Draw a coin's contour and display its diameter on the image.
    """
    moments = cv.moments(contour)
    if moments["m00"] == 0:
        return
    cx = int(moments["m10"] / moments["m00"])  # cx = (sum of x-coordinates) / area
    cy = int(moments["m01"] / moments["m00"])  # cy = (sum of y-coordinates) / area
    center = (cx, cy)

    min_distance = float("inf")
    for point in contour:
        # Calculate distance between two points |AB| = sqrt((x2 - x1)^2 + (y2 - y1)^2)
        x, y = point[0]
        distance = np.sqrt((x - cx) ** 2 + (y - cy) ** 2)
        min_distance = int(min(min_distance, distance))

    # Draw the new smaller circle
    cv.circle(image, center, min_distance, (255, 0, 0), 2)  # Blue circle, thickness 2

    # Calculate the diameter of the new circle in millimeters
    pixel_diameter = 2 * min_distance
    mm_diameter = (
        pixel_diameter / coin_diameter
    ) * coin_diameter  # Scale using the coin's diameter

    # Display the diameter in millimeters on the image
    text = f"Diameter: {mm_diameter:.2f} mm"
    cv.utText(
        image,
        text,
        (cx + min_distance + 10, cy),
        cv.FONT_HERSHEY_SIMPLEX,
        0.5,
        (255, 255, 255),
        1,
    )


def find_px_to_mm_ratio_2(image, contour: np.ndarray, coin_diameter: float = 23.25) -> float:
    """
    Accounting for side of the coin being in the image, so the minEnclosingCirlce would exclude it
    """
    # Find the center of the contour
    moments = cv.moments(contour)
    if moments["m00"] == 0:
        return 0
    cx = int(moments["m10"] / moments["m00"])  # cx = (sum of x-coordinates) / area
    cy = int(moments["m01"] / moments["m00"])  # cy = (sum of y-coordinates) / area
    center = (cx, cy)

    # Calculate distance from center to each point on the contour
    min_distance = float("inf")
    for point in contour:
        # Calculate distance between two points |AB| = sqrt((x2 - x1)^2 + (y2 - y1)^2)
        x, y = point[0]
        distance = np.sqrt((x - cx) ** 2 + (y - cy) ** 2)
        min_distance = min(min_distance, distance)

    # Using min_distance as radius messurment
    diameter_px = 2 * min_distance

    # Calculate pixel to mm ratio
    pixel_to_mm_ratio = diameter_px / coin_diameter

    # For visualization
    (x, y), min_enclosing_radius = cv.minEnclosingCircle(contour)

    # Draw both circles for comparison
    cv.circle(image, center, 3, (0, 0, 255), -1)  # Red dot for center
    cv.circle(image, center, int(min_distance), (0, 255, 0), 2)  # Green circle for inscribed circle
    cv.circle(
        image, center, int(min_enclosing_radius), (255, 0, 0), 2
    )  # Blue circle for enclosing circle

    return pixel_to_mm_ratio


def output(image, contour, radius=None):
    """
    For testing:
    Outputs all the different circle contours gotten with seperate algorithms
    """
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
