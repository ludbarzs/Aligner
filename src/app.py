import base64

import cv2 as cv
import numpy as np
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS

from detection.drawer_processor import DrawerProcessor

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
        ]
        "real_width_mm": 530,
        "real_height_mm": 330,
    }
    """
    try:
        # Get data from request
        data = request.json

        # Validate input
        if not data or "imageData" not in data or "coordinates" not in data:
            return jsonify({"error": "Missing required data"}), 400

        image_data = data["imageData"]
        coordinates = data["coordinates"]
        real_width_mm = data["realWidthMm"]
        real_height_mm = data["realHeightMm"]

        # Process base64 image data
        if "," in image_data:
            _, encoded = image_data.split(",", 1)
        else:
            encoded = image_data

        # Decode image
        binary = base64.b64decode(encoded)
        image = np.asarray(bytearray(binary), dtype=np.uint8)
        image = cv.imdecode(image, cv.IMREAD_COLOR)

        if image is None:
            return jsonify({"error": "Invalid image data"}), 400

        corrected_image, x_ratio, y_ratio = DrawerProcessor.process_drawer_image(
            image, coordinates, real_width_mm, real_height_mm
        )

        _, buffer = cv.imencode(".png", corrected_image)
        encoded_image = base64.b64encode(buffer).decode("utf-8")

        return jsonify(
            {
                "success": True,
                "processedImage": f"data:image/png;base64,{encoded_image}",
                "coordinates": coordinates,
            }
        )

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
