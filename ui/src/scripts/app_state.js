/**
 * Stores:
 * - Progress bar progressing
 */
export const AppState = {
  currentImage: null,
  
  setCurrentImage(imageData) {
    this.currentImage = imageData;
    // Persist to localStorage
    localStorage.setItem('currentImage', imageData);
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
    }
    return this.currentImage;
  },
  
  clearCurrentImage() {
    this.currentImage = null;
    // Clear from localStorage too
    localStorage.removeItem('currentImage');
  }
};
