from image_processing import *


def main():
    image = utils.load_image("../images/test_7.jpg")
    prepared_image = utils.prepare_image(image)

    contours = utils.find_contours(prepared_image)

    circle = coin_detection.coin_top_left_corner(contours)

    px_to_mm_ratio = coin_detection.find_px_to_mm_ratio(circle)


main()
