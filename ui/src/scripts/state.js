/**
 * Stores and manages drawer corner cordinates
 * Track image rotation, mirroring
 * Manages workflow step state
 * Stores image data
 */
class AppState {
  constructor() {
    this.coordinates = [];
    this.currentRotation = 0;
    this.isMirrored = false;
    this.currentWorkflowStep = 1; // 1: Adjust, 2: Place dots
    this.allowDotPlacement = false;
    this.imageData = null;
    this.originalImageData = null;
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
}

export const appState = new AppState();
