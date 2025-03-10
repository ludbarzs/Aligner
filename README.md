# Aligner

This project is a software tool designed to help users organize tools and objects in drawers or workspaces using image processing and 3D modeling techniques. The program takes an image of a drawer with tools laid out in a specific arrangement, processes the image to detect objects, and generates a 2D sketch with measurements. It also provides the ability to export the layout as a 3D model file (e.g., .F3D), which can be used for further customization or 3D printing.

The project is part of a qualification project for a programming degree and is motivated by the need for efficient organization in workshops, garages, and other workspaces.

Features

    Image Processing:
        The program processes an image of a drawer with tools and detects the corners of the drawer using user input.
        It corrects the perspective of the image to ensure accurate measurements.

    Object Detection:
        The program identifies objects (e.g., tools) in the drawer using contour detection.
        It can detect circular objects (e.g., coins) to establish a scale for measurements.

    Measurement and Scaling:
        The program calculates the pixel-to-millimeter ratio using a reference object (e.g., a coin of known diameter).
        It measures the dimensions of objects in the drawer and displays them on the image.

    2D Sketch Generation:
        The program generates a 2D sketch of the drawer layout, including the positions and dimensions of the objects.

    3D Model Export:
        The program provides functionality to export the drawer layout as a 3D model file (e.g., .F3D) for further use in CAD software or 3D printing.
