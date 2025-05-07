/**
 * Applies CSS transformations to both image and coordinates
 * Returns transformed image data and coordinates
 */
export function applyCSSTransformations(imageElement, coordinates) {
  const computedStyle = window.getComputedStyle(imageElement);
  const transform = computedStyle.transform;

  // No transformation needed if none applied
  if (!transform || transform === "none") {
    return {
      transformedImage: imageElement.src,
      transformedCoords: coordinates,
    };
  }

  // Create canvas for image transformation
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const imgWidth = imageElement.naturalWidth;
  const imgHeight = imageElement.naturalHeight;

  // Parse the transform matrix
  const matrix = new DOMMatrix(transform);

  // Handle dimension changes for rotations
  if (matrix.a === 0 && matrix.d === 0) {
    // 90° or 270° rotation - swap dimensions
    canvas.width = imgHeight;
    canvas.height = imgWidth;
  } else {
    canvas.width = imgWidth;
    canvas.height = imgHeight;
  }

  // Apply transformation to image
  ctx.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
  ctx.drawImage(imageElement, 0, 0);

  // Apply same transformation to coordinates
  const transformedCoords = coordinates.map((coord) => {
    const point = new DOMPoint(coord.x, coord.y);
    const transformed = point.matrixTransform(matrix);
    return { x: Math.round(transformed.x), y: Math.round(transformed.y) };
  });

  return {
    transformedImage: canvas.toDataURL("image/png"),
    transformedCoords,
  };
}
