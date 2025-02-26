from image_processing.circularity import detect_circles
from image_processing.utils import find_contours, load_image, prepare_image, view_image


def main():
    image = load_image("../images/test_2.jpg")
    prepared_image = prepare_image(image)

    contours = find_contours(prepared_image)

    circles = detect_circles(contours)
    view_image(image, contours)


main()
