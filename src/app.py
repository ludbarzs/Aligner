import base64

import cv2 as cv
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS

from processors.image_processor import ImageProcessor
from processors.request_processor import RequestProcessor

app = Flask(__name__)
CORS(app)


@app.route("/process-image", methods=["POST"])
@app.route("/process-image", methods=["POST"])
def process_image():
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

        # Get original image dimensions
        original_height, original_width = image.shape[:2]

        # Transform coordinates if rotation is applied and coordinates exist
        if "coordinates" in data and data["coordinates"]:
            rotation = data.get("transformations", {}).get("rotation", 0)

            # Transform coordinates to match the rotated image coordinate system
            transformed_coordinates = ImageProcessor.transform_coordinates_for_rotation(
                data["coordinates"], original_width, original_height, rotation
            )

            # Update the data with transformed coordinates
            data["coordinates"] = transformed_coordinates

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
            "dxf_data": result.get("dxf_data"),
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
