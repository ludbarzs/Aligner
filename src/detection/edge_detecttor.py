"""
Edge detection processor module for finding edges and contours in images
"""

from typing import List, Tuple
import numpy as np
import cv2 as cv


class EdgeDetector:
    """
    Handles edge detection operations on images
    """

    @staticmethod
    def prepare_image(
        image: np.ndarray,
        blur_kernel_size: Tuple[int, int] = (5, 5),
        canny_low: int = 30,
        canny_high: int = 130,
        morph_kernel_size: Tuple[int, int] = (5, 5),
    ) -> np.ndarray:
        """
        Prepares an image for contour detection by applying various filters

        Args:
            image: Input image as a NumPy array
            blur_kernel_size: Size of the Gaussian blur kernel
            canny_low: First threshold for Canny edge detector
            canny_high: Second threshold for Canny edge detector
            morph_kernel_size: Size of the morphological operations kernel

        Returns:
            Processed image with highlighted edges
        """

        # Convert to grayscale
        gray_image = cv.cvtColor(image, cv.COLOR_BGR2GRAY)

        # Apply gaussian blur
        blurred_image = cv.GaussianBlur(gray_image, blur_kernel_size, 0)

        # Detects edges using Canny EF
        edges_image = cv.Canny(blurred_image, canny_low, canny_high)

        # Apply morhpological closing
        kernel = cv.getStructuringElement(cv.MORPH_RECT, morph_kernel_size)
        closed_edges = cv.morphologyEx(edges_image, cv.MORPH_CLOSE, kernel)

        return closed_edges

    @staticmethod
    def find_contours(image: np.ndarray, min_area: float = 1000) -> List[np.ndarray]:
        """
        Finds contours in a binary image and filters by minimum area

        Args:
            image: Binary image (output from prepare_image)
            min_area: Minimum contour area to keep

        Returns:
            List of filtered contours
        """
        contours, _ = cv.findContours(image, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
        filtered_contours = [cnt for cnt in contours if cv.contourArea(cnt) > min_area]
        return filtered_contours

    @staticmethod
    def draw_contours(
        image: np.ndarray,
        contours: List[np.ndarray],
        thickness: int = 3,
    ) -> np.ndarray:
        """
        Draws contours on the original image

        Args:
            image: Original image to draw on
            contours: List of contours to draw
            thickness: Line thickness

        Returns:
            Image with drawn contours
        """
        result = image.copy()
        cv.drawContours(result, contours, -1, (0, 255, 0), thickness)
        return result

    @staticmethod
    def process_image(
        image: np.ndarray,
        min_contour_area: float = 1000,
        return_edges: bool = False,
        blur_kernel_size: Tuple[int, int] = (5, 5),
        canny_low: int = 30,
        canny_high: int = 130,
        morph_kernel_size: Tuple[int, int] = (5, 5),
    ) -> dict:
        """
        Complete edge detection workflow

        Args:
            image: Original input image
            min_contour_area: Minimum contour area to keep
            return_edges: Whether to include edge image in result
            blur_kernel_size: Size of the Gaussian blur kernel
            canny_low: First threshold for Canny edge detector
            canny_high: Second threshold for Canny edge detector
            morph_kernel_size: Size of the morphological operations kernel

        Returns:
            Dictionary with processed results:
            {
                'contoured_image': image with contours drawn,
                'contours': list of contours (optional),
                'edge_image': binary edge image (optional)
            }
        """
        # Process the image to find edges
        edge_image = EdgeDetector.prepare_image(
            image,
            blur_kernel_size=blur_kernel_size,
            canny_low=canny_low,
            canny_high=canny_high,
            morph_kernel_size=morph_kernel_size,
        )

        # Find contours
        contours = EdgeDetector.find_contours(edge_image, min_contour_area)

        # Draw contours on original image
        contoured_image = EdgeDetector.draw_contours(image, contours)

        # Prepare result dictionary
        result = {"contoured_image": contoured_image, "contours": contours}

        if return_edges:
            result["edge_image"] = edge_image

        return result
