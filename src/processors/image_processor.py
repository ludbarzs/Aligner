import cv2 as cv
import numpy as np

from errors.error import Error


class ImageProcessor:

    @staticmethod
    def process_transformations(
        image: np.ndarray, is_mirror: bool, rotation: int
    ) -> np.ndarray:
        """Apply transformation to image
        Args:
               image: Input image as a NumPy array in OpenCV format (BGR)
               is_mirror: Whether to apply horizontal mirroring (left-right flip)
               rotation: Rotation angle in degrees (must be 0, 90, 180, or 270)

           Returns:
               np.ndarray: Transformed image as a NumPy array
        """
        processed_image = image.copy()

        # Apply mirroring
        if is_mirror:
            processed_image = cv.flip(image, 1)

        if rotation == 90:
            processed_image = cv.rotate(image, cv.ROTATE_90_CLOCKWISE)
        elif rotation == 180:
            processed_image = cv.rotate(image, cv.ROTATE_180)
        elif rotation == 270:
            processed_image = cv.rotate(image, cv.ROTATE_90_COUNTERCLOCKWISE)

        return processed_image
