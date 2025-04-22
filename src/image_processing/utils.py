from typing import (List, Optional, Tuple, Union, overload)

import cv2 as cv
import numpy as np


class ImageProcessor:
    """
    Handles image loading, processing and contour denection options
    """

    @overload
    def __init__(self, image: np.ndarray) -> None: ...

    @overload
    def __init__(self, image_path: str) -> None: ...

    def __init__(self, image: Union[np.ndarray, str]) -> None:
        """
        Inintialize the image processor with either a path to the image
        or a np.ndarray of the image
        """
        self.original_image = None
        self.gray_image = None
        self.blurred_image = None
        self.edges_image = None
        self.processed_image = None
        self.contours = None

        if isinstance(image, str):
            self.load_from_path(image)
        elif image is not None:
            self.original_image = image.copy()

    def load_from_path(self, image_path: str) -> np.ndarray:
        """
        Load image from file path

        Raises:
            FileNotFoundError: If image connot be loaded
        """
        image = cv.imread(image_path)

        if image is None:
            raise FileNotFoundError(f"Could not load image: {image_path}")

        self.original_image = image
        return self.original_image

    def convert_to_grayscale(self) -> np.ndarray:
        """
        Convert the original image to grayscale.

        Returns:
            Grayscale image

        Raises:
            ValueError: If no image is loaded
        """
        if self.original_image is None:
            raise ValueError("No image loaded. Use load_from_path() first.")

        self.gray_image = cv.cvtColor(self.original_image, cv.COLOR_BGR2GRAY)
        return self.gray_image

    def apply_gaussian_blur(
        self, kernel_size: Tuple[int, int] = (5, 5), sigma: int = 0
    ) -> np.ndarray:
        """
        Apply Gaussian blur to the grayscale image.

        Args:
            kernel_size: Size of the Gaussian kernel
            sigma: Standard deviation of the Gaussian kernel

        Returns:
            Blurred image

        Raises:
            ValueError: If grayscale image is not available
        """
        if self.gray_image is None:
            self.convert_to_grayscale()

        self.blurred_image = cv.GaussianBlur(self.gray_image, kernel_size, sigma)
        return self.blurred_image

    def detect_edges(self, low_threshold: int = 50, high_threshold: int = 150) -> np.ndarray:
        """
        Apply Canny edge detection to the blurred image.

        Args:
            low_threshold: Lower threshold for hysteresis procedure
            high_threshold: Upper threshold for hysteresis procedure

        Returns:
            Image with detected edges

        Raises:
            ValueError: If blurred image is not available
        """
        if self.blurred_image is None:
            self.apply_gaussian_blur()

        self.edges_image = cv.Canny(self.blurred_image, low_threshold, high_threshold)
        return self.edges_image

    def apply_morphology(
        self,
        operation: int = cv.MORPH_CLOSE,
        kernel_shape: int = cv.MORPH_RECT,
        kernel_size: Tuple[int, int] = (9, 9),
    ) -> np.ndarray:
        """
        Apply morphological operation to the edges image.

        Args:
            operation: Morphological operation (e.g., cv.MORPH_CLOSE)
            kernel_shape: Shape of the structuring element
            kernel_size: Size of the structuring element

        Returns:
            Image after morphological operation

        Raises:
            ValueError: If edges image is not available
        """
        if self.edges_image is None:
            self.detect_edges()

        kernel = cv.getStructuringElement(kernel_shape, kernel_size)
        self.processed_image = cv.morphologyEx(self.edges_image, operation, kernel)
        return self.processed_image

    def prepare_image(
        self,
        blur_kernel_size: Tuple[int, int] = (5, 5),
        canny_low: int = 50,
        canny_high: int = 150,
        morph_kernel_size: Tuple[int, int] = (9, 9),
    ) -> np.ndarray:
        """
        Process the image for contour detection by running all processing steps.

        Args:
            blur_kernel_size: Size of Gaussian blur kernel
            canny_low: Lower threshold for Canny edge detection
            canny_high: Upper threshold for Canny edge detection
            morph_kernel_size: Size of morphological kernel for closing operation

        Returns:
            Processed image ready for contour detection
        """
        self.convert_to_grayscale()
        self.apply_gaussian_blur(blur_kernel_size)
        self.detect_edges(canny_low, canny_high)
        self.apply_morphology(kernel_size=morph_kernel_size)

        return self.processed_image

    def find_contours(self, min_area: float = 1000) -> List[np.ndarray]:
        """
        Find contours in the processed image.

        Args:
            min_area: Minimum contour area to include in results

        Returns:
            List of contours meeting the minimum area requirement

        Raises:
            ValueError: If the image hasn't been processed yet
        """
        if self.processed_image is None:
            raise ValueError("Image not processed. Use prepare_image() first.")

        contours, _ = cv.findContours(
            self.processed_image, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE
        )
        self.contours = [cnt for cnt in contours if cv.contourArea(cnt) > min_area]

        return self.contours

    def get_contour_image(
        self, thickness: int = 2, color: Tuple[int, int, int] = (0, 255, 0)
    ) -> np.ndarray:
        """
        Creates a copy of the original image with contours drawn on it.

        Args:
            thickness: Line thickness for contours
            color: RGB color tuple for contours

        Returns:
            Image with contours drawn on it
        """
        if self.original_image is None:
            raise ValueError("No image loaded.")
        if self.contours is None:
            raise ValueError("No contours found. Use find_contours() first.")

        result = self.original_image.copy()
        cv.drawContours(result, self.contours, -1, color, thickness)
        return result

    def view_image(self, image: Optional[np.ndarray] = None, window_name: str = "Image"):
        """
        Display an image in a window.

        Args:
            image: Image to display. If None, displays the original image
            window_name: Name of the window
        """
        display_image = image if image is not None else self.original_image

        if display_image is None:
            raise ValueError("No image to display")

        cv.namedWindow(window_name, cv.WINDOW_NORMAL)
        cv.imshow(window_name, display_image)
        cv.moveWindow(window_name, 0, 0)
        cv.waitKey(0)
        cv.destroyAllWindows()

    def process_and_find_contours(self, min_area: float = 1000) -> List[np.ndarray]:
        """
        Convenience method to prepare the image and find contours in one step.

        Args:
            min_area: Minimum contour area to include in results

        Returns:
            List of contours meeting the minimum area requirement
        """
        self.prepare_image()
        return self.find_contours(min_area)
