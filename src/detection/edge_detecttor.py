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
        """

        # Convert to grayscale
        gray_image = cv.cvtColor(image, cv.COLOR_BGR2GRAY)

        # Apply gaussian blur
        blurred_image = cv.GaussianBlur(gray_image, blur_kernel_size, 0)

        # Detects edges using Canny
        edges_image = cv.Canny(blurred_image, canny_low, canny_high)

        # Apply morhpological closing
        kernel = cv.getStructuringElement(cv.MORPH_RECT, morph_kernel_size)
        closed_edges = cv.morphologyEx(edges_image, cv.MORPH_CLOSE, kernel)

        return closed_edges

    @staticmethod
    def find_contours(image: np.ndarray, min_area: float = 1000) -> List[np.ndarray]:
        """
        Finds contours in a binary image and filters by minimum area
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
        Complete edge detection, all in one
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
