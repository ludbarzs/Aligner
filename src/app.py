import base64

import cv2 as cv
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS

from processors.image_processor import ImageProcessor
from processors.request_processor import RequestProcessor

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


@app.route("/process-image", methods=["POST"])
def process_image():
    """
    Endpoint to receive an image with coordinates

    Expected JSON format:
    {
        "imageData": "data:image/png;base64,iVBORw0KGgo...",
        "coordinates": [
            {"x": 100, "y": 200},
            {"x": 300, "y": 200},
            {"x": 300, "y": 400},
            {"x": 100, "y": 400}
        ],
        "realWidthMm": 530,
        "realHeightMm": 330,
        "transformations": {                    # Optional, defaults: {"mirrored": false, "rotation": 0}
            "mirrored": true,
            "rotation": 90
        },
        "edgeDetectionSettings": {              # Optional edge detection parameters
            "blurKernelSize": [5, 5],          # Optional, defaults to [5, 5]. Must be odd numbers.
            "cannyLow": 30,                     # Optional, defaults to 30
            "cannyHigh": 130,                   # Optional, defaults to 130
            "morphKernelSize": [5, 5]          # Optional, defaults to [5, 5]. Must be odd numbers.
        }
    }

    Returns:
    {
        "success": true,
        "processedImage": "data:image/png;base64,...",  # Base64 encoded processed image
        "edgeImage": "data:image/png;base64,...",       # Base64 encoded edge detection image
        "contouredImage": "data:image/png;base64,...",  # Base64 encoded image with contours
        "coordinates": [                                 # Processed/adjusted coordinates
            {"x": float, "y": float},
            ...
        ],
        "xRatio": float,                                # Ratio for x-axis measurements
        "yRatio": float,                                # Ratio for y-axis measurements
        "transformations": {                            # Applied transformations
            "mirrored": boolean,
            "rotation": int
        }
    }

    Error Response:
    {
        "success": false,
        "error": "Error message description"
    }
    """
    try:
        data = request.json

        # Validate input
        is_valid, error = ImageProcessor.validate_input(data)
        if not is_valid:
            return jsonify({"success": False, "error": error}), 400

        # Decode and validate image
        image = ImageProcessor.decode_image(data["imageData"])
        if image is None:
            return jsonify({"success": False, "error": "Invalid image data"}), 400

        # TODO: Delete the following or transfrom before validation
        # # Validate coordinates
        # is_valid, error = ImageProcessor.validate_coordinates(
        #     image, data["coordinates"]
        # )
        # if not is_valid:
        #     return jsonify({"success": False, "error": error}), 400

        # Process request
        result = RequestProcessor.process_request(data)

        # Prepare response
        response = {
            "success": True,
            "processedImage": ImageProcessor.encode_image(result["image"]),
            "edgeImage": result["edge_image"],
            "contouredImage": ImageProcessor.encode_image(result["contoured_image"]),
            "xRatio": result.get("x_ratio"),
            "yRatio": result.get("y_ratio"),
            "coordinates": result.get("coordinates"),
            "transformations": result.get("transformations"),
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
