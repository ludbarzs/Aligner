"""
Drawer detection and perspective correction module
"""

from typing import Tuple
import cv2 as cv
import numpy as np

from errors.error import Error


class DrawerProcessor:
    """
    Handles drawer detection and perspective correction
    Containst stateless methods for processing drawer image
    """

    @staticmethod
    def order_corners(corners: np.ndarray) -> np.ndarray:
        """Orders corners in: Left-Up, Right-up, Right-down, Left-down"""
        if corners.shape[0] != 4:
            raise ValueError(f"Expected 4 values, got {corners.shape[0]}")

        # Sums and subtracts each two points x and y
        sums = np.zeros(4)
        diffs = np.zeros(4)

        i = 0
        for x, y in corners:
            sums[i] = x + y
            diffs[i] = x - y
            i += 1

        top_left_index = np.argmin(sums)  # x - lowest, y - lowest
        bottom_right_index = np.argmax(sums)  # x - lowest, y - greatest
        top_right_index = np.argmax(diffs)  # x - greatest, y - lowest
        bottom_left_index = np.argmin(diffs)  # x - greatest, y - greatest

        return np.array(
            [
                corners[top_left_index],
                corners[top_right_index],
                corners[bottom_right_index],
                corners[bottom_left_index],
            ]
        )

    @staticmethod
    def get_drawer_dimensions_px(
        corners: np.ndarray,
    ) -> np.ndarray:
        """
        Calculates drawer dimensions in pixels

        Args:
            corners: Ordered corners array

        Returns:
            Array of dimensions [top_px, right_px, bottom_px, left_px]
        """
        # Boundary px size
        top_px = np.linalg.norm(corners[1] - corners[0])
        bottom_px = np.linalg.norm(corners[2] - corners[3])
        right_px = np.linalg.norm(corners[2] - corners[1])
        left_px = np.linalg.norm(corners[3] - corners[0])

        return np.array([top_px, right_px, bottom_px, left_px])

    @staticmethod
    def calculate_axis_ratios(
        corners: np.ndarray, real_width_mm: float, real_height_mm: float
    ) -> Tuple[float, float]:
        """
        Calculates pixel to mm ratio for both axes

        Args:
            corners: Ordered corners array
            real_width_mm: Actual drawer width in mm
            real_height_mm: Actual drawer height in mm

        Returns:
            Tuple of (x_ratio, y_ratio)
        """
        top_px = np.linalg.norm(corners[1] - corners[0])
        bottom_px = np.linalg.norm(corners[2] - corners[3])
        avg_width_px = (top_px + bottom_px) / 2

        right_px = np.linalg.norm(corners[2] - corners[1])
        left_px = np.linalg.norm(corners[3] - corners[0])
        avg_height_px = (right_px + left_px) / 2

        x_ratio = avg_width_px / real_width_mm
        y_ratio = avg_height_px / real_height_mm

        return x_ratio, y_ratio

    @staticmethod
    def correct_perspective(
        image: np.ndarray,
        corners: np.ndarray,
        real_width_mm: float,
        real_height_mm: float,
    ) -> Tuple[np.ndarray, float, float]:
        """
        Corrects perspective distortion in image based on drawer corners

        Args:
            image: Original image
            corners: Ordered corners array
            real_width_mm: Actual drawer width in mm
            real_height_mm: Actual drawer height in mm

        Returns:
            Tuple of (corrected_image, x_ratio, y_ratio)
        """
        x_ratio, y_ratio = DrawerProcessor.calculate_axis_ratios(
            corners, real_width_mm, real_height_mm
        )

        target_width_px = int(real_width_mm * x_ratio)
        target_height_px = int(real_height_mm * y_ratio)

        # Destination points: Rectangle
        dst_points = np.array(
            [
                [0, 0],
                [target_width_px, 0],
                [target_width_px, target_height_px],
                [0, target_height_px],
            ],
            dtype=np.float32,
        )

        src_point = corners.astype(np.float32)

        perspective_matrix = cv.getPerspectiveTransform(src_point, dst_points)

        corrected_image = cv.warpPerspective(
            image, perspective_matrix, (target_width_px, target_height_px)
        )

        final_x_ratio = target_width_px / real_width_mm
        final_y_ratio = target_height_px / real_height_mm

        return corrected_image, final_x_ratio, final_y_ratio

    @staticmethod
    def process_drawer_image(
        image: np.ndarray,
        corners: np.ndarray,
        real_width_mm: float,
        real_height_mm: float,
    ) -> Tuple[np.ndarray, float, float]:
        """
        Complete drawer processing workflow: orders corners, calculates ratios,
        correct perspective

        Args:
            image: Original image
            corners: Unordered corners array
            real_width_mm: Drawer width in mm
            real_height_mm: Drawer height in mm

        Returns:
            Tuple of (corrected_image, x_ratio, y_ratio)
        """

        # Order corners
        ordered_corners = DrawerProcessor.order_corners(corners)

        corrected_image, x_ratio, y_ratio = DrawerProcessor.correct_perspective(
            image, ordered_corners, real_width_mm, real_height_mm
        )

        return corrected_image, x_ratio, y_ratio
