from typing import Dict, Any
from detection.edge_detecttor import EdgeDetector
import numpy as np
from processors.image_processor import ImageProcessor
from detection.drawer_detector import DrawerDetector


class RequestProcessor:
    @staticmethod
    def get_default_transformations() -> Dict[str, Any]:
        return {"mirrored": False, "rotation": 0}

    @staticmethod
    def process_request(data: Dict) -> Dict:
        """Main processing pipeline"""
        transformations = data.get(
            "transformations", RequestProcessor.get_default_transformations()
        )

        coordinates = ImageProcessor.parse_coordinates(data["coordinates"])
        image = ImageProcessor.decode_image(data["imageData"])

        # Apply transformations
        transformed_image = ImageProcessor.process_transformations(
            image, bool(transformations["mirrored"]), int(transformations["rotation"])
        )

        # Process drawer image
        corrected_image, x_ratio, y_ratio = DrawerDetector.process_drawer_image(
            transformed_image,
            coordinates,
            float(data["realWidthMm"]),
            float(data["realHeightMm"]),
        )

        # Run edge detection and find contours

        edge_results = EdgeDetector.process_image(
            corrected_image,
            min_contour_area=1000,
            return_edges=True,
        )

        return {
            "image": corrected_image,
            "contoured_image": edge_results["contoured_image"],
            "edge_image": ImageProcessor.encode_image(edge_results["edge_image"]),
            "coordinates": data["coordinates"],
            "x_ratio": x_ratio,
            "y_ratio": y_ratio,
            "transformations": transformations,
        }
