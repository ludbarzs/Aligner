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

        # Apply rotation
        if rotation == 90:
            processed_image = cv.rotate(image, cv.ROTATE_90_CLOCKWISE)
        elif rotation == 180:
            processed_image = cv.rotate(image, cv.ROTATE_180)
        elif rotation == 270:
            processed_image = cv.rotate(image, cv.ROTATE_90_COUNTERCLOCKWISE)

        return processed_image

    # Add this new method to src/processors/image_processor.py
    @staticmethod
    def transform_coordinates(coordinates, image_dimensions, is_mirror, rotation):
        """
        Transform coordinates from the transformed image back to the original image space.

        Args:
            coordinates: Numpy array of [x, y] coordinates in the transformed image
            image_dimensions: Tuple of (width, height) of the original image
            is_mirror: Whether the image was mirrored (boolean)
            rotation: Rotation angle in degrees (0, 90, 180, 270)

        Returns:
            Numpy array of transformed coordinates matching original image space
        """
        width, height = image_dimensions
        transformed_coordinates = []

        for point in coordinates:
            x, y = point

            # First handle rotation transformations
            if rotation == 0:
                # No rotation
                original_x, original_y = x, y
            elif rotation == 90:
                # For 90° clockwise rotation
                original_x = y
                original_y = width - x  # Note width here, not height
            elif rotation == 180:
                # For 180° rotation
                original_x = width - x
                original_y = height - y
            elif rotation == 270:
                # For 270° clockwise rotation (90° counterclockwise)
                original_x = height - y
                original_y = x

            # Then handle mirroring transformation
            if is_mirror:
                if rotation in [0, 180]:
                    # For 0° or 180° rotation, mirror affects X axis
                    original_x = width - original_x
                elif rotation in [90, 270]:
                    # For 90° or 270° rotation, mirror affects Y axis
                    original_y = height - original_y

            transformed_coordinates.append([original_x, original_y])

        return np.array(transformed_coordinates)
