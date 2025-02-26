import cv2 as cv
import numpy as np


def load_image(image_path: str) -> np.ndarray:
    image = cv.imread(image_path)
    if image is None:
        raise FileNotFoundError(f"Could not load image: {image_path}")
    return image


def prepare_image(image: np.ndarray) -> np.ndarray:
    gray_image = cv.cvtColor(image, cv.COLOR_BGR2GRAY)
    blurred_image = cv.GaussianBlur(gray_image, (5, 5), 0)
    edges_image = cv.Canny(blurred_image, 42, 126)

    # Apply morphological closing to merge nearby edges
    kernel = cv.getStructuringElement(cv.MORPH_RECT, (5, 5))
    closed_edges = cv.morphologyEx(edges_image, cv.MORPH_CLOSE, kernel)

    return closed_edges


def find_contours(image: np.ndarray, min_area: float = 300) -> np.ndarray:
    contours, _ = cv.findContours(image, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    filtered_contours = [cnt for cnt in contours if cv.contourArea(cnt) > min_area]

    return filtered_contours


def view_image(image: np.ndarray, contours: np.ndarray = None):
    if contours is not None:
        cv.drawContours(image, contours, -1, (0, 255, 0), 2)

    cv.imshow("image", image)
    cv.moveWindow("image", 0, 0)

    # Close on keypress
    cv.waitKey(0)
    cv.destroyAllWindows()
