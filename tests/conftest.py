import cv2 as cv
import numpy as np
import pytest

from src.image_processing.utils import find_contours


@pytest.fixture
def synthetic_image():
    """Sythentic test image that simulates a coin (circle)"""
    # Create a 400x400 image with a gray background
    img = np.zeros((400, 400, 3), dtype=np.uint8)
    img.fill(200)  # Better contrast (didnt detect coin otherwise)

    cv.circle(
        img, (100, 100), 50, (40, 40, 40), -1
    )  # image, center of circle, cirlce radius, circle colour, thickness (-1 filled)

    return img


@pytest.fixture
def prepared_image(synthetic_image):
    """processing the synthetic image"""
    gray = cv.cvtColor(synthetic_image, cv.COLOR_BGR2GRAY)
    blurred = cv.GaussianBlur(gray, (7, 7), 0)
    edges = cv.Canny(blurred, 50, 150)

    kernel = cv.getStructuringElement(cv.MORPH_RECT, (9, 9))
    closed = cv.morphologyEx(edges, cv.MORPH_CLOSE, kernel)

    return closed


@pytest.fixture
def contours(prepared_image):
    """Find contours in the prepared image."""
    return find_contours(prepared_image)
