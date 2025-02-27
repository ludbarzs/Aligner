import cv2 as cv
import numpy as np

from src.image_processing.circularity import coin_top_left_corner, find_px_to_mm_ratio


def test_detect_coin_in_top_left(contours):
    coin = coin_top_left_corner(contours)
    assert coin is not None


def test_find_px_to_mm_ratio(contours):
    image = np.zeros((200, 200))
    cv.circle(
        image, (100, 100), 50, 255, -1
    )  # image, center of circle, cirlce radius, circle colour, thickness (-1 filled)
    controus, _ = cv.findContours(image, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    coin_cointour = contours[0]

    # Euro coin diameter 23.25
    ratio = find_px_to_mm_ratio(coin_cointour)
    expected_ratio = 100 / 23.25

    # Accuracy of 1%
    assert (ratio - expected_ratio) < 0.01


def test_no_coin_detected():
    img = np.zeros((200, 200, 3))
    gray = cv.cvtColor(image, cv.COLOR_BGR2GRAY)
    edges = cv.Canny(gray, 50, 150)
    contours, _ = cv.findContours(edges, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

    coin_contour = coin_top_left_corner(contours)

    assert coin_contour is None
