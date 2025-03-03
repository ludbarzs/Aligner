from image_processing.coin_detection import (
    coin_top_left_corner,
    find_px_to_mm_ratio,
)
from image_processing.drawer_detection import (
    correct_perspective,
    measure_object_in_drawer,
    select_drawer_corners,
    view_drawer_boundaries,
)
from image_processing.utils import find_contours, load_image, prepare_image, view_image


def main():
    image = load_image("images/test_14.jpg")
    prepared_image = prepare_image(image)

    contours = find_contours(prepared_image)

    corners = select_drawer_corners(image)

    corrected_image, ratio = correct_perspective(image, corners, 537, 340)
    measure_object_in_drawer(corrected_image, ratio)
    measure_object_in_drawer(corrected_image, ratio)
    measure_object_in_drawer(corrected_image, ratio)
    measure_object_in_drawer(corrected_image, ratio)
    measure_object_in_drawer(corrected_image, ratio)
    measure_object_in_drawer(corrected_image, ratio)

    view_drawer_boundaries(image, corners)


def view_outputs():
    image = load_image("images/test_12.jpg")
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


# view_outputs()
main()
