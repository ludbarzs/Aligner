from typing import (List, Tuple)

import cv2 as cv
import numpy as np


class ImageVisualizer:
    """Handles visualization of images, contours, and measurements"""

    @staticmethod
    def display_image(
        image: np.ndarray,
        window_name: str = "Image",
        wait_key: bool = True,  # Weather to destroy the window on keypress
        move_to_origin: bool = True,  # Move to top left corner
    ) -> None:
        """
        Display an image in a window.

        Args:
            image: Image to display
            window_name: Name of the window
            wait_key: Whether to wait for a key press
            move_to_origin: Whether to move the window to the top-left corner
        """
        if image is None:
            raise ValueError("No image to display")

        cv.namedWindow(window_name, cv.WINDOW_NORMAL)
        cv.imshow(window_name, image)

        if move_to_origin:
            cv.moveWindow(window_name, 0, 0)

        if wait_key:
            cv.waitKey(0)
            cv.destroyAllWindows()

    @staticmethod
    def draw_contours(
        image: np.ndarray,
        contours: List[np.ndarray],
        color: Tuple[int, int, int] = (0, 255, 0),
        thickness: int = 1,
    ) -> np.ndarray:
        """
        Draw contours on an image.

        Args:
            image: Image to draw on
            contours: List of contours to draw
            color: RGB color for contours
            thickness: Line thickness

        Returns:
            Image with contours drawn on it
        """
        result = image.copy()
        cv.drawContours(result, contours, -1, color, thickness)
        return result

    @staticmethod
    def draw_circle(
        image: np.ndarray,
        center: Tuple[int, int],
        radius: int,
        color: Tuple[int, int, int] = (0, 255, 0),
        thickness: int = 2,
    ) -> np.ndarray:
        """
        Draw a circle on an image.

        Args:
            image: Image to draw on
            center: Center coordinates (x, y)
            radius: Circle radius
            color: RGB color
            thickness: Line thickness, -1 for filled circle

        Returns:
            Image with circle drawn on it
        """
        result = image.copy()
        cv.circle(result, center, radius, color, thickness)
        return result

    @staticmethod
    def add_text(
        image: np.ndarray,
        text: str,
        position: Tuple[int, int],
        font_scale: float = 0.7,
        color: Tuple[int, int, int] = (255, 255, 255),
        thickness: int = 2,
    ) -> np.ndarray:
        """
        Add text to an image.

        Args:
            image: Image to draw on
            text: Text to add
            position: Position coordinates (x, y)
            font_scale: Font scale
            color: RGB color
            thickness: Line thickness

        Returns:
            Image with text added
        """
        result = image.copy()
        cv.putText(result, text, position, cv.FONT_HERSHEY_SIMPLEX, font_scale, color, thickness)
        return result

    @staticmethod
    def draw_measurement(
        image: np.ndarray,
        point1: Tuple[int, int],
        point2: Tuple[int, int],
        measurement_mm: float,
        line_color: Tuple[int, int, int] = (0, 255, 0),
        text_color: Tuple[int, int, int] = (255, 255, 255),
    ) -> np.ndarray:
        """
        Draw a measurement line with distance label.

        Args:
            image: Image to draw on
            point1: First point coordinates
            point2: Second point coordinates
            measurement_mm: Measurement in millimeters
            line_color: RGB color for the line
            text_color: RGB color for the text

        Returns:
            Image with measurement drawn on it
        """
        result = image.copy()

        # Draw the line
        cv.line(result, point1, point2, line_color, 2)

        # Calculate midpoint for text placement
        mid_point = ((point1[0] + point2[0]) // 2, (point1[1] + point2[1]) // 2)

        # Add measurement text
        cv.putText(
            result,
            f"{measurement_mm:.1f} mm",
            mid_point,
            cv.FONT_HERSHEY_SIMPLEX,
            0.7,
            text_color,
            2,
        )

        return result

    @staticmethod
    def create_interactive_measurement_window(
        image: np.ndarray, x_ratio: float, y_ratio: float, window_name: str = "Measure Objects"
    ) -> None:
        """
        Create an interactive window for measuring distances.

        Args:
            image: Image to display and measure on
            x_ratio: Pixel to mm ratio in x direction
            y_ratio: Pixel to mm ratio in y direction
            window_name: Name of the window
        """
        measuring_image = image.copy()
        points = []

        def click_event(event, x, y, flag, param):
            nonlocal points, measuring_image

            if event == cv.EVENT_LBUTTONDOWN:
                points.append((x, y))
                cv.circle(measuring_image, (x, y), 3, (0, 0, 255), -1)

                if len(points) == 2:
                    dx = abs(points[1][0] - points[0][0])
                    dy = abs(points[1][1] - points[0][1])

                    # Add .5% correction factor
                    x_distance_mm = dx / x_ratio * 1.005
                    y_distance_mm = dy / y_ratio * 1.005

                    distance_mm = np.sqrt((x_distance_mm) ** 2 + (y_distance_mm) ** 2)

                    cv.line(measuring_image, points[0], points[1], (0, 255, 0), 2)

                    # Display distance
                    mid_point = (
                        (points[0][0] + points[1][0]) // 2,
                        (points[0][1] + points[1][1]) // 2,
                    )
                    cv.putText(
                        measuring_image,
                        f"{distance_mm:.1f} mm",
                        mid_point,
                        cv.FONT_HERSHEY_SIMPLEX,
                        0.7,
                        (255, 0, 0),
                        2,
                    )

                    # Reset for new measurement
                    points.clear()

                cv.imshow(window_name, measuring_image)

        cv.namedWindow(window_name, cv.WINDOW_NORMAL)
        cv.imshow(window_name, measuring_image)
        cv.setMouseCallback(window_name, click_event)

        cv.waitKey(0)
        cv.destroyAllWindows()
