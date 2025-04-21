from file_conversion.dxf_exporter import (contours_to_dxf)
from image_processing.coin_detection import (detect_circles)
from image_processing.drawer_detection import (correct_perspective, draw_contour_line,
                                               find_inscribed_circle_diameter,
                                               select_drawer_corners)
from image_processing.utils import (find_contours, load_image, prepare_image, view_image)


def main():
    """
    Main method
    """
    # Load Image
    image = load_image("images/test_19.jpg")

    # User selects drawer corners
    corners = select_drawer_corners(image)
    # Auto select corners for test_14.jpg
    # corners = np.array([[149, 82], [1939, 75], [1995, 1213], [115, 1240]])

    # Image perspective gets corrected
    irl_width = 297
    irl_length = 210
    corrected_image, x_ratio, y_ratio = correct_perspective(image, corners, irl_width, irl_length)

    # Prepare corrected image for contour finding (Grayscale, canny, closeing edges)
    prepared_image = prepare_image(corrected_image)

    # Find contours
    contours = find_contours(prepared_image)

    output_path = contours_to_dxf(
        contours, "output_file.dxf", x_ratio, y_ratio, irl_width, irl_length
    )
    print(f"DXF file saved to: {output_path}")

    # Get all circles in image
    circles = detect_circles(contours)

    circles_image = corrected_image.copy()

    # Drawes the inscribed diameter of all circles
    for circle in circles:
        find_inscribed_circle_diameter(circles_image, circle, x_ratio, y_ratio)

    view_image(circles_image)

    # Draw the largest line in contour for tests
    for contour in contours:
        draw_contour_line(corrected_image, contour, x_ratio, y_ratio)

    view_image(corrected_image, contours)
    # Allows user to measure
    measure_object_in_drawer(corrected_image, x_ratio, y_ratio)


main()
