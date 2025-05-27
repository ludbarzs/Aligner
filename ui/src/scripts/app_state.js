/**
 * Manages application state and provides methods to interact with it
 */
export const AppState = {
  currentImage: null,
  currentRotation: 0,
  isMirrored: false,
  
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

  // New methods for handling transformations
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
  }
};
