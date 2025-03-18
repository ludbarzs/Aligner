from typing import Tuple

import cv2 as cv
import numpy as np


def calculate_axis_specific_ratios(
    corners: np.ndarray, real_width_mm: float, real_height_mm: float
) -> Tuple[float, float]:
    """
    Calculate separate ratios for x and y axes.

    Args:
        corners: Four corners of the drawer in the order: top-left, top-right, bottom-right, bottom-left
        real_width_mm: Actual width of the drawer in mm
        real_height_mm: Actual height of the drawer in mm

    Returns:
        Tuple of (x_ratio, y_ratio) in px/mm
    """
    # Calculate width in pixels (average of top and bottom edges)
    top_width_px = np.linalg.norm(corners[1] - corners[0])
    bottom_width_px = np.linalg.norm(corners[2] - corners[3])
    avg_width_px = (top_width_px + bottom_width_px) / 2

    # Calculate height in pixels (average of left and right edges)
    left_height_px = np.linalg.norm(corners[3] - corners[0])
    right_height_px = np.linalg.norm(corners[2] - corners[1])
    avg_height_px = (left_height_px + right_height_px) / 2

    # Calculate separate ratios for each axis
    x_ratio = avg_width_px / real_width_mm  # px/mm for x-axis
    y_ratio = avg_height_px / real_height_mm  # px/mm for y-axis

    return x_ratio, y_ratio


def correct_perspective_with_separate_ratios(
    image: np.ndarray,
    corners: np.ndarray,
    real_width_mm: float,
    real_height_mm: float,
    x_correction_factor: float = 1.0,  # Adjustment factor for x-axis calibration
) -> Tuple[np.ndarray, Tuple[float, float]]:
    """
    Corrects perspective distortion with separate x and y calibration.

    Args:
        image: Input image with perspective distortion
        corners: Four corners of the drawer in the order: top-left, top-right, bottom-right, bottom-left
        real_width_mm: Actual width of the drawer in mm
        real_height_mm: Actual height of the drawer in mm
        x_correction_factor: Factor to adjust x-axis calibration (e.g., 29/31 = 0.935 for your case)

    Returns:
        Tuple of (corrected image, (x_ratio, y_ratio))
    """
    # Calculate separate ratios for x and y axes
    x_ratio, y_ratio = calculate_axis_specific_ratios(
        corners, real_width_mm, real_height_mm
    )

    # Apply correction factor to x-ratio
    corrected_x_ratio = x_ratio * x_correction_factor

    # Calculate target dimensions in pixels
    target_width_px = int(real_width_mm * corrected_x_ratio)
    target_height_px = int(real_height_mm * y_ratio)

    # Define the destination points (rectangle)
    dst_points = np.array(
        [
            [0, 0],  # top-left
            [target_width_px, 0],  # top-right
            [target_width_px, target_height_px],  # bottom-right
            [0, target_height_px],  # bottom-left
        ],
        dtype=np.float32,
    )

    # Convert source points to the right format
    src_points = corners.astype(np.float32)

    # Calculate perspective transform matrix
    perspective_matrix = cv.getPerspectiveTransform(src_points, dst_points)

    # Apply the transformation
    corrected_image = cv.warpPerspective(
        image, perspective_matrix, (target_width_px, target_height_px)
    )

    # Final calibrated ratios
    final_x_ratio = target_width_px / real_width_mm
    final_y_ratio = target_height_px / real_height_mm

    return corrected_image, (final_x_ratio, final_y_ratio)


def measure_with_axis_specific_ratios(
    corrected_image: np.ndarray, x_ratio: float, y_ratio: float
) -> None:
    """
    Measure objects using separate x and y ratios.

    Args:
        corrected_image: Perspective-corrected image
        x_ratio: Calibrated pixel to mm ratio for x-axis
        y_ratio: Calibrated pixel to mm ratio for y-axis
    """
    measuring_image = corrected_image.copy()
    points = []

    def click_event(event, x, y, flag, param):
        nonlocal points, measuring_image

        if event == cv.EVENT_LBUTTONDOWN:
            points.append((x, y))
            cv.circle(measuring_image, (x, y), 3, (0, 0, 255), -1)

            if len(points) == 2:
                # Calculate x and y differences
                dx = abs(points[1][0] - points[0][0])
                dy = abs(points[1][1] - points[0][1])

                # Calculate distances using appropriate ratios
                x_distance_mm = dx / x_ratio
                y_distance_mm = dy / y_ratio

                # Calculate Euclidean distance accounting for different ratios
                distance_mm = np.sqrt((x_distance_mm) ** 2 + (y_distance_mm) ** 2)

                # Draw line
                cv.line(measuring_image, points[0], points[1], (0, 255, 0), 2)

                # Display distance
                mid_point = (
                    (points[0][0] + points[1][0]) // 2,
                    (points[0][1] + points[1][1]) // 2,
                )

                # Show both components and total distance
                text_y_offset = 0
                cv.putText(
                    measuring_image,
                    f"Total: {distance_mm:.1f} mm",
                    (mid_point[0], mid_point[1] + text_y_offset),
                    cv.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (255, 0, 0),
                    2,
                )

                text_y_offset += 20
                cv.putText(
                    measuring_image,
                    f"X: {x_distance_mm:.1f} mm",
                    (mid_point[0], mid_point[1] + text_y_offset),
                    cv.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (255, 0, 0),
                    1,
                )

                text_y_offset += 20
                cv.putText(
                    measuring_image,
                    f"Y: {y_distance_mm:.1f} mm",
                    (mid_point[0], mid_point[1] + text_y_offset),
                    cv.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (255, 0, 0),
                    1,
                )

                # Reset for new measurement
                points.clear()

            cv.imshow("Measure Objects", measuring_image)

    print("\n=== Measuring Objects ===")
    print("Click on two points to measure the distance between them.")
    print("Press any key to exit measuring mode.")

    cv.namedWindow("Measure Objects", cv.WINDOW_NORMAL)
    cv.imshow("Measure Objects", measuring_image)
    cv.setMouseCallback("Measure Objects", click_event)

    cv.waitKey(0)
    cv.destroyAllWindows()


def calibrate_with_known_measurement(
    corrected_image: np.ndarray, initial_x_ratio: float, initial_y_ratio: float
) -> Tuple[float, float]:
    """
    Fine-tune calibration using a known measurement in the corrected image.

    Args:
        corrected_image: The perspective-corrected image
        initial_x_ratio: Initial estimate of x-axis px/mm ratio
        initial_y_ratio: Initial estimate of y-axis px/mm ratio

    Returns:
        Tuple of refined (x_ratio, y_ratio)
    """
    calibration_image = corrected_image.copy()
    points = []

    def click_event(event, x, y, flag, param):
        nonlocal points, calibration_image

        if event == cv.EVENT_LBUTTONDOWN:
            points.append((x, y))
            cv.circle(calibration_image, (x, y), 5, (0, 0, 255), -1)

            if len(points) == 2:
                # Draw line
                cv.line(calibration_image, points[0], points[1], (0, 255, 0), 2)

                # Calculate pixel distance
                dx = abs(points[1][0] - points[0][0])
                dy = abs(points[1][1] - points[0][1])

                # Estimate distances using current ratios
                x_distance_mm = dx / initial_x_ratio
                y_distance_mm = dy / initial_y_ratio

                # Display for user
                mid_point = (
                    (points[0][0] + points[1][0]) // 2,
                    (points[0][1] + points[1][1]) // 2,
                )

                # Show both components
                text_y_offset = 0
                cv.putText(
                    calibration_image,
                    f"X: {x_distance_mm:.1f} mm",
                    (mid_point[0], mid_point[1] + text_y_offset),
                    cv.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (255, 0, 0),
                    2,
                )

                text_y_offset += 20
                cv.putText(
                    calibration_image,
                    f"Y: {y_distance_mm:.1f} mm",
                    (mid_point[0], mid_point[1] + text_y_offset),
                    cv.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (255, 0, 0),
                    2,
                )

            cv.imshow("Calibration", calibration_image)

    print("\n=== Fine Calibration ===")
    print("Click on two points of a known distance.")

    cv.namedWindow("Calibration", cv.WINDOW_NORMAL)
    cv.imshow("Calibration", calibration_image)
    cv.setMouseCallback("Calibration", click_event)

    # Wait for user to select points
    cv.waitKey(0)
    cv.destroyAllWindows()

    if len(points) != 2:
        print("Calibration canceled or incomplete.")
        return initial_x_ratio, initial_y_ratio

    # Calculate pixel distances
    dx = abs(points[1][0] - points[0][0])
    dy = abs(points[1][1] - points[0][1])

    # Get actual measurements from user
    print("\nEnter the actual measurements of the selected points:")
    actual_x_mm = float(input("X-axis distance (mm): "))
    actual_y_mm = float(input("Y-axis distance (mm): "))

    # Calculate refined ratios
    refined_x_ratio = dx / actual_x_mm if actual_x_mm > 0 else initial_x_ratio
    refined_y_ratio = dy / actual_y_mm if actual_y_mm > 0 else initial_y_ratio

    print(f"\nRefined X ratio: {refined_x_ratio:.4f} px/mm")
    print(f"Refined Y ratio: {refined_y_ratio:.4f} px/mm")

    return refined_x_ratio, refined_y_ratio


def improved_drawer_measurement(image_path: str) -> None:
    """
    Complete workflow with improved calibration.

    Args:
        image_path: Path to the image file
    """
    from image_processing.drawer_detection import select_drawer_corners
    from image_processing.utils import load_image, view_image

    # Load image
    image = load_image(image_path)

    # Select drawer corners
    print("Please select the four corners of the drawer in this order:")
    print("1. Top-left  2. Top-right  3. Bottom-right  4. Bottom-left")
    corners = select_drawer_corners(image)

    if corners is None or len(corners) != 4:
        print("Error: Couldn't get valid drawer corners.")
        return

    # Get real dimensions from user
    print("\n=== Real Drawer Dimensions ===")
    real_width_mm = float(input("Enter the actual drawer width in mm: "))
    real_height_mm = float(input("Enter the actual drawer height in mm: "))

    # Calculate the x-axis correction factor based on your observation
    # If you measure 31mm when it should be 29mm, your correction factor is 29/31 ≈ 0.935
    print("\n=== X-Axis Correction ===")
    print("Your measurements showed that a 29mm object measures as 31mm.")
    print("This suggests an approximate correction factor of 29/31 = 0.935")

    x_correction = float(
        input("Enter x-axis correction factor (default: 0.935): ") or 0.935
    )

    # Apply perspective correction with the x-axis correction
    corrected_image, (x_ratio, y_ratio) = correct_perspective_with_separate_ratios(
        image, corners, real_width_mm, real_height_mm, x_correction_factor=x_correction
    )

    print("\n=== Perspective Correction Applied ===")
    print(f"X-axis ratio: {x_ratio:.4f} px/mm")
    print(f"Y-axis ratio: {y_ratio:.4f} px/mm")

    # Display the corrected image
    print("Displaying corrected image...")
    view_image(corrected_image)

    # Option to fine-tune calibration with a known object
    do_fine_calibration = (
        input(
            "\nWould you like to fine-tune calibration with a known measurement? (y/n): "
        ).lower()
        == "y"
    )

    if do_fine_calibration:
        x_ratio, y_ratio = calibrate_with_known_measurement(
            corrected_image, x_ratio, y_ratio
        )

    # Perform measurements with the calibrated ratios
    measure_with_axis_specific_ratios(corrected_image, x_ratio, y_ratio)


improved_drawer_measurement("images/test_4.jpg")
