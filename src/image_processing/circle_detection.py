from typing import (Optional, Tuple)

import cv2 as cv
import numpy as np


class Contour:
    """Class representing a contour with methods for analyzing its properties."""

    def __init__(self, contour_points: np.ndarray):
        self.points = contour_points
        self._moments = None
        self._center = None
        self._area = None
        self._perimeter = None
        self._circularity = None

    @property
    def moments(self):
        if self._moments is None:
            self._moments = cv.moments(self.points)
        return self._moments

    @property
    def center(self) -> Optional[Tuple[int, int]]:
        """Get the center (centroid) of the contour."""
        if self._center is None:
            if self.moments["m00"] == 0:
                return None
            cx = int(self.moments["m10"] / self.moments["m00"])
            cy = int(self.moments["m01"] / self.moments["m00"])
            self._center = (cx, cy)
        return self._center

    @property
    def area(self) -> float:
        """Get the area of the contour."""
        if self._area is None:
            self._area = cv.contourArea(self.points)
        return self._area

    @property
    def perimeter(self) -> float:
        """Get the perimeter of the contour."""
        if self._perimeter is None:
            self._perimeter = cv.arcLength(self.points, True)
        return self._perimeter

    @property
    def circularity(self) -> float:
        """
        Calculate circularity score (4 * pi * Area) / (Perimeter^2).
        A perfect circle has a score of 1.0.
        """
        if self._circularity is None:
            if self.perimeter == 0:
                self._circularity = 0
            else:
                self._circularity = (4 * np.pi * self.area) / (self.perimeter**2)
        return self._circularity

    def distance_to_point(self, point: Tuple[int, int] = (0, 0)) -> float:
        """Calculate distance from contour center to a point (default: origin)."""
        if self.center is None:
            return float('inf')

        cx, cy = self.center
        target_x, target_y = point
        return np.sqrt((cx - target_x) ** 2 + (cy - target_y) ** 2)

    def min_radius(self) -> float:
        """Find the minimum radius that fits inside the contour from its center."""
        if self.center is None:
            return 0

        cx, cy = self.center
        min_distance = float("inf")

        for point in self.points:
            x, y = point[0]
            distance = np.sqrt((x - cx) ** 2 + (y - cy) ** 2)
            min_distance = min(min_distance, distance)

        return min_distance

    def min_enclosing_circle(self) -> Tuple[Tuple[float, float], float]:
        """Get the minimum enclosing circle of the contour."""
        return cv.minEnclosingCircle(self.points)


class CircularContourProcessor:
    """
    Class for processing, filtering, and visualizing circular contours.
    Uses the Contour class for contour analysis.
    """

    def __init__(self, x_ratio: float, y_ratio: float, min_circularity: float = 0.85):
        """
        Initialize the circular contour processor.

        Args:
            x_ratio: Conversion ratio from pixels to mm for x-axis
            y_ratio: Conversion ratio from pixels to mm for y-axis
            min_circularity: Minimum circularity threshold (default: 0.85)
        """
        self.x_ratio = x_ratio
        self.y_ratio = y_ratio
        self.min_circularity = min_circularity
        self.circular_contours = []

    def filter_circular_contours(self, contours_points):
        """
        Filter contours to find circular shapes based on circularity threshold.

        Args:
            contours_points: List of numpy arrays representing contours from cv.findContours

        Returns:
            List of Contour objects that meet the circularity threshold
        """
        self.circular_contours = []

        for contour_points in contours_points:
            contour = Contour(contour_points)
            if contour.circularity >= self.min_circularity:
                self.circular_contours.append(contour)

        return self.circular_contours

    def px_to_mm(self, pixels):
        """Convert pixels to millimeters using the average of x and y ratios."""
        return pixels * ((self.x_ratio + self.y_ratio) / 2)

    def draw_contour(self, image, contour, color=(0, 255, 0), thickness=2):
        """Draw a single contour on the image."""
        return cv.drawContours(image, [contour.points], 0, color, thickness)

    def draw_circles(self, image, contour, draw_min=True, draw_max=True):
        """
        Draw minimum inscribed and maximum enclosing circles for a contour.

        Args:
            image: The image to draw on
            contour: Contour object
            draw_min: Whether to draw the minimum (inscribed) circle
            draw_max: Whether to draw the maximum (enclosing) circle

        Returns:
            Image with circles drawn
        """
        if contour.center is None:
            return image

        center = contour.center

        # Draw center point
        cv.circle(image, center, 3, (0, 0, 255), -1)  # Red dot for center

        # Get center coordinates
        cx, cy = center

        # Draw the minimum (inscribed) circle if requested
        if draw_min:
            min_radius_px = contour.min_radius()
            min_radius_mm = self.px_to_mm(min_radius_px)
            min_diameter_mm = 2 * min_radius_mm

            cv.circle(image, center, int(min_radius_px), (0, 255, 0), 2)  # Green circle

            # Add text for minimum radius
            min_text = f"Min Dia: {min_diameter_mm:.2f}mm"
            cv.putText(
                image,
                min_text,
                (cx + 10, cy + 20),
                cv.FONT_HERSHEY_SIMPLEX,
                0.5,
                (255, 255, 255),
                1,
            )

        # Draw the maximum (enclosing) circle if requested
        if draw_max:
            (x, y), max_radius_px = contour.min_enclosing_circle()
            max_center = (int(x), int(y))
            max_radius_mm = self.px_to_mm(max_radius_px)
            max_diameter_mm = 2 * max_radius_mm

            cv.circle(image, max_center, int(max_radius_px), (255, 0, 0), 2)  # Blue circle

            # Add text for maximum radius
            max_text = f"Max Dia: {max_diameter_mm:.2f}mm"
            cv.putText(
                image,
                max_text,
                (cx + 10, cy - 10),
                cv.FONT_HERSHEY_SIMPLEX,
                0.5,
                (255, 255, 255),
                1,
            )

        return image

    def process_image(self, image, contours_points):
        """
        Process an image to find circular objects, draw them, and display measurements.

        Args:
            image: The image to process
            contours_points: List of contour points from cv.findContours

        Returns:
            Processed image with circles and measurements
        """
        # Create a copy of the image to draw on
        output_image = image.copy()

        # Filter contours to get circular ones
        circular_contours = self.filter_circular_contours(contours_points)

        # Draw each circular contour with its measurements
        for contour in circular_contours:
            # Draw the contour itself
            self.draw_contour(output_image, contour)

            # Draw the circles and their measurements
            self.draw_circles(output_image, contour)

        return output_image

    def display_results(self, image):
        """Display the processed image."""
        cv.namedWindow("Circular Objects", cv.WINDOW_NORMAL)
        cv.imshow("Circular Objects", image)
        cv.moveWindow("Circular Objects", 0, 0)
        cv.waitKey(0)
        cv.destroyAllWindows()

    def get_circle_measurements(self):
        """
        Get measurements for all circular contours.

        Returns:
            List of dictionaries containing measurements for each circular contour
        """
        measurements = []

        for contour in self.circular_contours:
            if contour.center is None:
                continue

            # Get min radius (inscribed circle)
            min_radius_px = contour.min_radius()
            min_radius_mm = self.px_to_mm(min_radius_px)

            # Get max radius (enclosing circle)
            (_, _), max_radius_px = contour.min_enclosing_circle()
            max_radius_mm = self.px_to_mm(max_radius_px)

            # Create measurement dictionary
            measurement = {
                'center': contour.center,
                'circularity': contour.circularity,
                'min_diameter_mm': 2 * min_radius_mm,
                'max_diameter_mm': 2 * max_radius_mm,
                'area_mm2': self.px_to_mm(self.px_to_mm(contour.area)),  # px² to mm²
            }

            measurements.append(measurement)

        return measurements
