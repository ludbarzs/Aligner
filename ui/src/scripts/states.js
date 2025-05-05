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

  resetCoordinates() {
    this.coordinates = [];
  }

  addCoordinate(coord) {
    if (this.coordinates.length < 4) {
      this.coordinates.push(coord);
      return true;
    }
    return false;
  }

  getTransformations() {
    return {
      rotation: this.currentRotation,
      mirrored: this.isMirrored,
    };
  }

  setImageData(data) {
    this.imageData = data;
    if (!this.originalImageData) {
      this.originalImageData = data;
    }
  }
}

export const appState = new AppState();
