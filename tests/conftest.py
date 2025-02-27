import cv2 as cv
import pytest

from src.image_processing.utils import prepare_image


@pytest.fixture
def image():
    image = cv.imread("../images/test7.jpg")
    return image


@pytest.fixture
def contours(image):
    controus = prepare_image(image)
    return contours
