from typing import Dict, List, Optional, Tuple
import cv2 as cv
import numpy as np
import base64


class ImageProcessor:

    @staticmethod
    def transform_coordinates_for_rotation(
        coordinates, image_width, image_height, rotation
    ):
        """
        Transform coordinates to match the rotated image coordinate system

        Args:
            coordinates: List of coordinate dictionaries [{"x": int, "y": int}, ...]
            image_width: Original image width
            image_height: Original image height
            rotation: Rotation angle (0, 90, 180, 270)

        Returns:
            List of transformed coordinates
        """
        transformed_coords = []

        for coord in coordinates:
            x, y = coord["x"], coord["y"]

            if rotation == 0:
                # No transformation needed
                new_x, new_y = x, y
            elif rotation == 90:
                # 90° clockwise: (x,y) -> (y, width-1-x)
                new_x = y
                new_y = image_width - 1 - x
            elif rotation == 180:
                # 180°: (x,y) -> (width-1-x, height-1-y)
                new_x = image_width - 1 - x
                new_y = image_height - 1 - y
            elif rotation == 270:
                # 270° clockwise: (x,y) -> (height-1-y, x)
                new_x = image_height - 1 - y
                new_y = x
            else:
                raise ValueError(f"Unsupported rotation angle: {rotation}")

            transformed_coords.append({"x": int(new_x), "y": int(new_y)})

        return transformed_coords

    @staticmethod
    def process_transformations(
        image: np.ndarray, is_mirror: bool, rotation: int
    ) -> np.ndarray:
        """Apply transformation to image
        Args:
               image: Input image as a NumPy array in OpenCV format (BGR)
               is_mirror: Whether to apply horizontal mirroring (left-right flip)
               rotation: Rotation angle in degrees (must be 0, 90, 180, or 270)
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

    @staticmethod
    def validate_input(data: Dict) -> Tuple[bool, Optional[str]]:
        """Validate the input data structure"""
        if not data or "imageData" not in data:
            return False, "Missing required data"
        return True, None

    @staticmethod
    def parse_coordinates(coordinates: List[Dict]) -> np.ndarray:
        """Convert coordinates from JSON format to numpy array"""
        coordinate_list = [[point["x"], point["y"]] for point in coordinates]
        return np.array(coordinate_list)

    @staticmethod
    def decode_image(image_data: str) -> np.ndarray:
        """Decode base64 image data to OpenCV format"""
        if "," in image_data:
            _, encoded = image_data.split(",", 1)
        else:
            encoded = image_data

        binary = base64.b64decode(encoded)
        image = np.asarray(bytearray(binary), dtype=np.uint8)
        return cv.imdecode(image, cv.IMREAD_COLOR)

    @staticmethod
    def validate_coordinates(
        image: np.ndarray, coordinates: List[Dict]
    ) -> Tuple[bool, Optional[str]]:
        """Check if all coordinates are within image boundaries"""
        height, width = image.shape[:2]
        for point in coordinates:
            x, y = point["x"], point["y"]
            if x < 0 or x >= width or y < 0 or y >= height:
                return False, (
                    f"Coordinate ({x}, {y}) is outside image boundaries "
                    f"(width: {width}, height: {height})"
                )
        return True, None

    @staticmethod
    def encode_image(image: np.ndarray) -> str:
        """Encode OpenCV image to base64 string"""
        _, buffer = cv.imencode(".png", image)
        return f"data:image/png;base64,{base64.b64encode(buffer).decode('utf-8')}"
