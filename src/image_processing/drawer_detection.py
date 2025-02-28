import cv2 as cv
import numpy as np
from utils import *


def select_drawer_corners(image: np.ndarray) -> np.ndarray:
    """User input to select corners"""
    corners = []

    def click_event(event, x, y, flags, param):
        if event == cv.EVENT_LBUTTONDOWN:
            corners.append((x, y))
            cv.circle(image, (x, y), 3, (0, 255, 0), -1)
            cv.imshow("Select Corners", image)
            if len(corners) == 4:
                cv.destroyAllWindows()

    cv.imshow("Select Corners", image)
    cv.setMouseCallback("Select Corners", click_event)
    cv.waitKey(0)

    return np.array(corners)


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

        rect = cv.minAreaRect(contour)
        (w, h) = rect[1]  # Contains width and height
        aspect_ratio = max(w, h) / min(w, h)  # Get aspect ratio that is positive

        # Refine the contour with minAreaRect
        box = cv.boxPoints(rect)
        box = np.int0(box)
        view_image(image, box)
