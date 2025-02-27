from image_processing.circularity import (
    coin_top_left_corner,
    find_px_to_mm_ratio,
)
from image_processing.utils import find_contours, load_image, prepare_image, view_image


def main():
    image = load_image("../images/test_7.jpg")
    prepared_image = prepare_image(image)

    contours = find_contours(prepared_image)

    circle = coin_top_left_corner(contours)
    view_image(image, circle)

    px_to_mm_ratio = find_px_to_mm_ratio(circle)
    print(f"Ratio: {px_to_mm_ratio}")


main()
