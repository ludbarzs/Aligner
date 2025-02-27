import cv2 as cv
import numpy as np


def load_image(image_path: str) -> np.ndarray:
    image = cv.imread(image_path)
    if image is None:
        raise FileNotFoundError(f"Could not load image: {image_path}")
    return image


def prepare_image(image: np.ndarray) -> np.ndarray:
    gray_image = cv.cvtColor(image, cv.COLOR_BGR2GRAY)
    blurred_image = cv.GaussianBlur(gray_image, (7, 7), 0)
    # high_contrast = cv.equalizeHist(blurred_image)
    # high_contrast = cv.convertScaleAbs(image, alpha=1, beta=0)  # beta=brightness
    edges_image = cv.Canny(blurred_image, 50, 150)

    # Apply morphological closing to merge nearby edges
    kernel = cv.getStructuringElement(cv.MORPH_RECT, (9, 9))
    closed_edges = cv.morphologyEx(edges_image, cv.MORPH_CLOSE, kernel)

    return closed_edges


def find_contours(image: np.ndarray, min_area: float = 1000) -> np.ndarray:
    contours, _ = cv.findContours(image, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    filtered_contours = [cnt for cnt in contours if cv.contourArea(cnt) > min_area]

    return filtered_contours


def view_image(image: np.ndarray, contours: np.ndarray = None):
    if contours is not None:
        # If it's a single contour, wrap it in a list
        if isinstance(contours, np.ndarray):
            contours = [contours]
        cv.drawContours(image, contours, -1, (0, 255, 0), 2)

    cv.imshow("image", image)
    cv.moveWindow("image", 0, 0)

    # Close on keypress
    cv.waitKey(0)
    cv.destroyAllWindows()
