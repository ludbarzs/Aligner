from typing import List

import cv2 as cv
import numpy as np

# Loading Image
image_path = "images/test_1.jpg"
image = cv.imread(image_path)

if image is None:
    print("Error: Image not loaded")
    exit(1)

gray_image = cv.cvtColor(image, cv.COLOR_BGR2GRAY)

blurred_image = cv.GaussianBlur(gray_image, (5, 5), 0)

edges_image = cv.Canny(blurred_image, 42, 126)

# Apply morphological closing to merge nearby edges
kernel = cv.getStructuringElement(cv.MORPH_RECT, (5, 5))
closed_edges = cv.morphologyEx(edges_image, cv.MORPH_CLOSE, kernel)

# Find contours (only external)
contours, _ = cv.findContours(closed_edges, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

# Filter contours by area
min_area = 300
filtered_contours = [cnt for cnt in contours if cv.contourArea(cnt) > min_area]

# Draw the simplified contours
output_image = image.copy()
cv.drawContours(output_image, filtered_contours, -1, (0, 255, 0), 2)

# Show image in a window
cv.imshow("Edges", output_image)
cv.moveWindow("Edges", 0, 0)

# Close on keypress
cv.waitKey(0)
cv.destroyAllWindows()


def calculate_circularity(contour: np.ndarray) -> float:
    """
    Circularity = (4 * pi * Area) / (Perimiter^2)
    """

    area = cv.contourArea(contour)
    perimeter = cv.arcLength(contour, True)

    if perimeter == 0:
        return 0

    circularity = (4 * np.pi * area) / (perimeter**2)

    return circularity


def detect_circle(countours: List[np.ndarray], min_circularity: float = 0.9) -> List[np.ndarray]:
    circles = []

    for contour in countours:
        circularity = calculate_circularity(contour)
        if circularity > min_circularity:
            circles.append(contour)

    return circles
