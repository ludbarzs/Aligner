import base64

import cv2 as cv
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


@app.route("/process-image", methods=["POST"])
def process_image():
    """
    Endpoint to process an image with coordinates
    Expected JSON format:
    {
        "imageData": "data:image/png;base64,iVBORw0KGgo...",
        "coordinates": [
            {"x": 100, "y": 200},
            {"x": 300, "y": 200},
            {"x": 300, "y": 400},
            {"x": 100, "y": 400}
        ]
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

        # Check for exactly 4 coordinates
        if len(coordinates) != 4:
            return jsonify({"error": "Exactly 4 coordinates are required"}), 400

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

        # Process image with coordinates
        processed_image = process_with_coordinates(image, coordinates)

        # Calculate area
        points = np.array(
            [(coord["x"], coord["y"]) for coord in coordinates], dtype=np.int32
        )
        area = calculate_area(points)

        # Encode the processed image to send back
        _, buffer = cv.imencode(".png", processed_image)
        encoded_image = base64.b64encode(buffer).decode("utf-8")

        return jsonify(
            {
                "success": True,
                "processedImage": f"data:image/png;base64,{encoded_image}",
                "area": area,
            }
        )

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


def process_with_coordinates(image, coordinates):
    """Process the image by drawing points and connecting lines"""
    points = np.array(
        [(coord["x"], coord["y"]) for coord in coordinates], dtype=np.int32
    )

    result = image.copy()

    # Draw red circles at each point
    for point in points:
        cv.circle(result, tuple(point), 10, (0, 0, 255), -1)

    # Draw green connecting lines
    cv.polylines(result, [points], True, (0, 255, 0), 3)

    # Add area text
    area = calculate_area(points)
    cv.putText(
        result,
        f"Area: {area:.2f} px²",
        (10, 30),
        cv.FONT_HERSHEY_SIMPLEX,
        1,
        (255, 255, 255),
        2,
    )

    return result


def calculate_area(points):
    """Calculate the area of a polygon defined by points"""
    # Use the Shoelace formula (Gauss's area formula)
    n = len(points)
    area = 0.0

    for i in range(n):
        j = (i + 1) % n
        area += points[i][0] * points[j][1]
        area -= points[j][0] * points[i][1]

    area = abs(area) / 2.0
    return area


if __name__ == "__main__":
    app.run(debug=True, port=5000)
