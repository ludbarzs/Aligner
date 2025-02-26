from typing import List

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
    countours: List[np.ndarray], min_circularity: float = 0.9
) -> List[np.ndarray]:
    circles = []

    for contour in countours:
        circularity = calculate_circularity(contour)
        if circularity > min_circularity:
            circles.append(contour)

    return circles
