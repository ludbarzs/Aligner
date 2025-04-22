from image_processing.utils import (ImageProcessor)


def main():
    """
    Main method
    """

    # Initialize and load image
    proc = ImageProcessor("images/test_19.jpg")

    # Image processing and edge detection with default values
    proc.process_and_find_contours()

    # # Custom processing with individual values
    # processor.convert_to_grayscale()
    # processor.apply_gaussian_blur(kernel_size=(7, 7))  # Using a larger blur kernel
    # processor.detect_edges(low_threshold=30, high_threshold=120)  # Custom edge thresholds
    # processor.apply_morphology(kernel_size=(11, 11))  # Larger morphology kernel
    # contours = processor.find_contours(min_area=1500)  # Higher min area

    proc.view_image(proc.processed_image)


main()
