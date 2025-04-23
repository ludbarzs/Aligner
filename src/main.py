from image_processing.drawer_detection import (DrawerProcessor)
from image_processing.image_visualizer import (ImageVisualizer)
from image_processing.utils import (ImageProcessor)


def main():
    """
    Main
    """
    # Image visualizer
    visualizer = ImageVisualizer
    image_path = "images/test_8.jpg"
    image = ImageProcessor.load_from_path(image_path)

    drawer_proc = DrawerProcessor(image)
    corrected_image, x_ratio, y_ratio = drawer_proc.quick_start(530, 330)

    # Initialize and load image
    proc = ImageProcessor(corrected_image)

    # Image processing and edge detection with default values
    proc.prepare_image()
    contours = proc.find_contours()
    visualizer.draw_contours(image, contours)

    # # Custom processing with individual values
    # processor.convert_to_grayscale()
    # processor.apply_gaussian_blur(kernel_size=(7, 7))  # Using a larger blur kernel
    # processor.detect_edges(low_threshold=30, high_threshold=120)  # Custom edge thresholds
    # processor.apply_morphology(kernel_size=(11, 11))  # Larger morphology kernel
    # contours = processor.find_contours(min_area=1500)  # Higher min area

    proc.view_image(proc.processed_image)


main()
