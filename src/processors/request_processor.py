from typing import Dict, Any
from detection.edge_detecttor import EdgeDetector
import numpy as np
from processors.image_processor import ImageProcessor
from detection.drawer_detector import DrawerDetector
from processors.dxf_processor import contours_to_dxf
import tempfile
import base64
import os


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

        image = ImageProcessor.decode_image(data["imageData"])
        
        # Handle coordinates if present (for initial processing)
        if "coordinates" in data:
            coordinates = ImageProcessor.parse_coordinates(data["coordinates"])
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
        else:
            # For edge detection updates, use the image as is
            corrected_image = image
            x_ratio = None
            y_ratio = None

        # Extract edge detection settings if provided
        edge_settings = data.get("edgeDetectionSettings", {})
        
        # Ensure blur kernel size is valid
        blur_kernel = edge_settings.get("blurKernelSize", [5, 5])
        if not isinstance(blur_kernel, list) or len(blur_kernel) != 2:
            blur_kernel = [5, 5]
        blur_kernel_size = (int(blur_kernel[0]), int(blur_kernel[1]))
        
        # Ensure Canny thresholds are valid integers
        try:
            canny_low = int(edge_settings.get("cannyLow", 30))
            canny_high = int(edge_settings.get("cannyHigh", 130))
        except (TypeError, ValueError):
            canny_low, canny_high = 30, 130
            
        # Ensure morph kernel size is valid
        morph_kernel = edge_settings.get("morphKernelSize", [5, 5])
        if not isinstance(morph_kernel, list) or len(morph_kernel) != 2:
            morph_kernel = [5, 5]
        morph_kernel_size = (int(morph_kernel[0]), int(morph_kernel[1]))

        # Run edge detection and find contours
        edge_results = EdgeDetector.process_image(
            corrected_image,
            min_contour_area=1000,
            return_edges=True,
            blur_kernel_size=blur_kernel_size,
            canny_low=canny_low,
            canny_high=canny_high,
            morph_kernel_size=morph_kernel_size,
        )

        # Generate DXF file if we have valid ratios and dimensions
        dxf_data = None
        if x_ratio is not None and y_ratio is not None:
            # Create temporary file for DXF
            with tempfile.NamedTemporaryFile(suffix='.dxf', delete=False) as tmp_file:
                dxf_path = contours_to_dxf(
                    edge_results["contours"],
                    tmp_file.name,
                    x_ratio,
                    y_ratio,
                    float(data["realWidthMm"]),
                    float(data["realHeightMm"])
                )
                # Read the DXF file and encode it as base64
                with open(dxf_path, 'rb') as dxf_file:
                    dxf_data = base64.b64encode(dxf_file.read()).decode('utf-8')
                # Clean up the temporary file
                os.unlink(dxf_path)

        result = {
            "image": corrected_image,
            "contoured_image": edge_results["contoured_image"],
            "edge_image": ImageProcessor.encode_image(edge_results["edge_image"]),
            "transformations": transformations,
        }

        # Only include coordinates, ratios and DXF if they were processed
        if "coordinates" in data:
            result.update({
                "coordinates": data["coordinates"],
                "x_ratio": x_ratio,
                "y_ratio": y_ratio,
                "dxf_data": dxf_data
            })

        return result
