import cv2 as cv
import numpy as np

from errors.error import Error


class ImageProcessor:

    @staticmethod
    def load_image(image_path: str):
        """Load image from path"""
        # if not isinstance(image_path, str):
        #     Error.type("str", type(image_path))
        image = cv.imread(image_path)

        if image is None:
            Error.file_not_found(image_path)

        return image
