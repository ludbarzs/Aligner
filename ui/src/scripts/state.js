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
    // Image types for edge detection
    this.edgeImage = null;
    this.contouredImage = null;
    // Real width and height of drawer in mm
    this.realWidthMm = 540;
    this.realHeightMm = 340;
    // x, y axis ratios
    this.xRatio = null;
    this.yRatio = null;
    this.edgeDetectionSettings = {
      blurKernelSize: [5, 5],
      cannyLow: 30,
      cannyHigh: 130,
      morphKernelSize: [5, 5],
      edgeThreshold: 80,
    };
  }
  /**
   * Edge detection parameters
   */

  /**
   * Update edge detection settings
   * @param {Object} settings - The settings to update
   */
  updateEdgeDetectionSettings(settings) {
    this.edgeDetectionSettings = {
      ...this.edgeDetectionSettings,
      ...settings,
    };

    // If a single edge threshold is provided, convert it to canny low/high
    if (settings.edgeThreshold !== undefined) {
      this.edgeDetectionSettings.cannyLow = Math.max(
        10,
        settings.edgeThreshold * 0.3,
      );
      this.edgeDetectionSettings.cannyHigh = settings.edgeThreshold;
    }

    console.log("Updated edge detection settings:", this.edgeDetectionSettings);
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
   * Store edge image data
   */
  setEdgeImage(data) {
    this.edgeImage = data;
  }

  /**
   * Store contoured image data
   */
  setContouredImage(data) {
    this.contouredImage = data;
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
