/**
 * Manages application state and provides methods to interact with it
 */
export const AppState = {
  currentImage: null,
  currentRotation: 0,
  isMirrored: false,
  cornerCoordinates: [],
  
  setCurrentImage(imageData) {
    this.currentImage = imageData;
    // Persist to localStorage
    localStorage.setItem('currentImage', imageData);
    // Reset transformations when setting new image
    this.resetTransformations();
  },
  
  getCurrentImage() {
    // Try to get from memory first, then localStorage
    if (this.currentImage) {
      return this.currentImage;
    }
    // Try to restore from localStorage
    const savedImage = localStorage.getItem('currentImage');
    if (savedImage) {
      this.currentImage = savedImage;
      // Also restore transformations
      this.restoreTransformations();
    }
    return this.currentImage;
  },
  
  clearCurrentImage() {
    this.currentImage = null;
    // Clear from localStorage too
    localStorage.removeItem('currentImage');
    this.resetTransformations();
  },

  // Corner coordinates methods
  setCornerCoordinates(coordinates) {
    this.cornerCoordinates = coordinates;
    localStorage.setItem('cornerCoordinates', JSON.stringify(coordinates));
  },

  getCornerCoordinates() {
    if (this.cornerCoordinates.length > 0) {
      return this.cornerCoordinates;
    }
    // Try to restore from localStorage
    const savedCoordinates = localStorage.getItem('cornerCoordinates');
    if (savedCoordinates) {
      this.cornerCoordinates = JSON.parse(savedCoordinates);
    }
    return this.cornerCoordinates;
  },

  clearCornerCoordinates() {
    this.cornerCoordinates = [];
    localStorage.removeItem('cornerCoordinates');
  },

  // Transformation methods
  setRotation(degrees) {
    this.currentRotation = degrees;
    localStorage.setItem('currentRotation', degrees.toString());
  },

  setMirrored(isMirrored) {
    this.isMirrored = isMirrored;
    localStorage.setItem('isMirrored', isMirrored.toString());
  },

  getTransformations() {
    return {
      rotation: this.currentRotation,
      mirrored: this.isMirrored
    };
  },

  resetTransformations() {
    this.currentRotation = 0;
    this.isMirrored = false;
    this.clearCornerCoordinates();
    localStorage.removeItem('currentRotation');
    localStorage.removeItem('isMirrored');
  },

  restoreTransformations() {
    // Restore rotation
    const savedRotation = localStorage.getItem('currentRotation');
    if (savedRotation !== null) {
      this.currentRotation = parseInt(savedRotation, 10);
    }

    // Restore mirror state
    const savedMirror = localStorage.getItem('isMirrored');
    if (savedMirror !== null) {
      this.isMirrored = savedMirror === 'true';
    }

    // Restore corner coordinates
    const savedCoordinates = localStorage.getItem('cornerCoordinates');
    if (savedCoordinates !== null) {
      this.cornerCoordinates = JSON.parse(savedCoordinates);
    }
  }
};
