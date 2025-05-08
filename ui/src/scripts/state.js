/**
 * Stores and manages drawer corner cordinates
 * Track image rotation, mirroring
 * Manages workflow step state
 * Stores image data
 * Stores drawer width/height
 */
class AppState {
  constructor() {
    this.coordinates = [];
    this.currentRotation = 0;
    this.isMirrored = false;
    this.currentWorkflowStep = 1; // 1: Adjust image, 2: Place dots
    this.allowDotPlacement = false;
    this.imageData = null;
    this.originalImageData = null;
    // Real width and height of drawer in mm
    this.realWidthMm = 540;
    this.realHeightMm = 340;
    // x, y axis ratios
    this.xRatio = null;
    this.yRatio = null;
  }

  /**
   * Reset all cordinates
   */
  resetCoordinates() {
    this.coordinates = [];
  }

  /**
   * Add cordinate to list
   */
  addCoordinate(coord) {
    if (this.coordinates.length < 4) {
      this.coordinates.push(coord);
      return true;
    }
    return false;
  }

  /**
   * Return image transformation (rotations, mirror)
   */
  getTransformations() {
    return {
      rotation: this.currentRotation,
      mirrored: this.isMirrored,
    };
  }

  /**
   * Store image data
   */
  setImageData(data) {
    this.imageData = data;
    if (!this.originalImageData) {
      this.originalImageData = data;
    }
  }
  /**
   * Update real world dimensions of the drawer
   * @param {number} width - Width in mm
   * @param {number} height - Height in mm
   */
  updateDimensions(width, height) {
    this.realWidthMm = width;
    this.realHeightMm = height;
  }
  updateRatios(xRatio, yRatio) {
    this.xRatio = xRatio;
    this.yRatio = yRatio;
  }
}

export const appState = new AppState();
