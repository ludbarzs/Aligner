from typing import Tuple

import cv2 as cv
import ezdxf
import numpy as np


def contours_to_dxf(
    contours: np.ndarray,
    file_path: str,
    x_ratio: float,
    y_ratio: float,
    irl_width: float,
    irl_length: float,
    origin: Tuple[float, float] = (0, 0),
) -> str:
    """Convert contours to DXF file with measurments"""

    if not file_path.lower().endswith(".dxf"):
        file_path += ".dxf"

    # Creates new DXF document with standard AutoCad format
    doc = ezdxf.new("R2010")

    msp = doc.modelspace()

    # Layers for different elements
    doc.layers.add(name="CONTOURS", dxfattribs={"color": 2})
    doc.layers.add(name="DIMENSIONS", dxfattribs={"color": 1})

    # Process each contour
    for contour in contours:
        # Convert to mm using ratios
        points_mm = []
        for point in contour:
            x_px, y_px = point[0]
            x_mm = x_px / x_ratio + origin[0]
            # Flipping y axis, since CV2 uses top left origin, ezdxf uses bottom left
            y_mm = -y_px / y_ratio + origin[1]
            points_mm.append((x_mm, y_mm))

        polyline = msp.add_lwpolyline(points_mm, dxfattribs={"layer": "CONTOURS"})
        polyline.close(True)

    try:
        doc.saveas(file_path)
        return file_path
    except IOError as e:
        print(f"Error saving DXF file: {e}")
        return ""
