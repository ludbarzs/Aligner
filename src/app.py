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
        "transformations": {
            "mirrored": true,
            "rotation": 90
        }
    }
    """
    try:
        data = request.json

        # Validate input
        is_valid, error = ImageProcessor.validate_input(data)
        if not is_valid:
            return jsonify({"error": error}), 400

        # Decode and validate image
        image = ImageProcessor.decode_image(data["imageData"])
        if image is None:
            return jsonify({"error": "Invalid image data"}), 400

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
            "coordinates": result["coordinates"],
            "xRatio": result["x_ratio"],
            "yRatio": result["y_ratio"],
            "transformations": result["transformations"],
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
