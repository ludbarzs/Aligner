import cv2 as cv
import numpy as np

# from core.image_processor import ImageProcessor
from errors.error import Error


def main():
    """Main"""

    Error.type("str", "dumdum")

    image_path = "images/test_1.jpg"
    ImageProcessor.load_image(image_path)


if __name__ == "__main__":
    main()
