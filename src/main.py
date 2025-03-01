from image_processing.coin_detection import coin_top_left_corner, find_px_to_mm_ratio
from image_processing.drawer_detection import (
    get_drawer_dimensions,
    select_drawer_corners,
    view_drawer_boundaries,
)
from image_processing.utils import find_contours, load_image, prepare_image, view_image


def main():
    image = load_image("images/test_11.jpg")
    prepared_image = prepare_image(image)

    contours = find_contours(prepared_image)

    coin = coin_top_left_corner(contours)

    px_to_mm_ratio = find_px_to_mm_ratio(image, coin, 23.25)

    corners = select_drawer_corners(image)
    print(get_drawer_dimensions(corners, px_to_mm_ratio))
    view_drawer_boundaries(image, corners)


def view_outputs():
    image = load_image("images/test_9.jpg")
    prepared_image = prepare_image(image)

    contours = find_contours(prepared_image)
    contour_image = image.copy()
    view_image(contour_image, contours)

    coin = coin_top_left_corner(contours)
    coin_image = image.copy()
    view_image(coin_image, coin)

    px_to_mm_ratio = find_px_to_mm_ratio(coin)

    corners = select_drawer_corners(image)
    view_drawer_boundaries(image, corners)
    print(corners)


main()
