from typing import Dict, Any
import numpy as np
from processors.image_processor import ImageProcessor
from detection.drawer_processor import DrawerProcessor


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
        corrected_image, x_ratio, y_ratio = DrawerProcessor.process_drawer_image(
            transformed_image,
            coordinates,
            float(data["realWidthMm"]),
            float(data["realHeightMm"]),
        )

        return {
            "image": corrected_image,
            "coordinates": data["coordinates"],
            "x_ratio": x_ratio,
            "y_ratio": y_ratio,
            "transformations": transformations,
        }
