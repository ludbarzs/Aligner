from image_processing.coin_detection import (
    coin_top_left_corner,
    find_px_to_mm_ratio,
)
from image_processing.drawer_detection import (
    correct_perspective,
    draw_contour_line,
    find_inscribed_circle_diameter,
    measure_object_in_drawer,
    select_drawer_corners,
    view_drawer_boundaries,
)
from image_processing.utils import find_contours, load_image, prepare_image, view_image


def main():
    image = load_image("images/test_17.jpg")

    corners = select_drawer_corners(image)
    corrected_image, x_ratio, y_ratio = correct_perspective(image, corners, 540, 340)

    prepared_image = prepare_image(corrected_image)

    contours = find_contours(prepared_image)
    coin = coin_top_left_corner(contours)
    view_image(find_inscribed_circle_diameter(corrected_image, coin, x_ratio, y_ratio))

    for contour in contours:
        draw_contour_line(corrected_image, contour, x_ratio, y_ratio)

    measure_object_in_drawer(corrected_image, x_ratio, y_ratio)


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
