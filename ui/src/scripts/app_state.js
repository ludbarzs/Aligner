/**
 * Manages application state and provides methods to interact with it
 */
export const AppState = {
  currentImage: null,
  currentRotation: 0,
  isMirrored: false,
  cornerCoordinates: [],
  drawerWidth: 530, // Default width in mm
  drawerHeight: 330, // Default height in mm
  edgeDetectionSettings: {
    blurKernelSize: [5, 5],
    cannyLow: 30,
    cannyHigh: 130,
    morphKernelSize: [5, 5],
    edgeThreshold: 80
  },
  contouredImage: null,
  dxfData: null,
  
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
  },

  // Drawer dimensions methods
  setDrawerDimensions(width, height) {
    this.drawerWidth = parseInt(width);
    this.drawerHeight = parseInt(height);
    localStorage.setItem('drawerWidth', width);
    localStorage.setItem('drawerHeight', height);
  },

  getDrawerDimensions() {
    return {
      width: this.drawerWidth,
      height: this.drawerHeight
    };
  },

  // Edge detection settings methods
  setEdgeDetectionSettings(settings) {
    this.edgeDetectionSettings = settings;
    localStorage.setItem('edgeDetectionSettings', JSON.stringify(settings));
  },

  getEdgeDetectionSettings() {
    if (this.edgeDetectionSettings) {
      return this.edgeDetectionSettings;
    }
    // Try to restore from localStorage
    const savedSettings = localStorage.getItem('edgeDetectionSettings');
    if (savedSettings) {
      this.edgeDetectionSettings = JSON.parse(savedSettings);
    }
    return this.edgeDetectionSettings;
  },

  // Contoured image methods
  setContouredImage(imageData) {
    this.contouredImage = imageData;
    localStorage.setItem('contouredImage', imageData);
  },

  getContouredImage() {
    if (this.contouredImage) {
      return this.contouredImage;
    }
    // Try to restore from localStorage
    const savedImage = localStorage.getItem('contouredImage');
    if (savedImage) {
      this.contouredImage = savedImage;
    }
    return this.contouredImage;
  },

  clearContouredImage() {
    this.contouredImage = null;
    localStorage.removeItem('contouredImage');
  },

  // DXF data methods
  setDxfData(data) {
    this.dxfData = data;
    localStorage.setItem('dxfData', data);
  },

  getDxfData() {
    if (this.dxfData) {
      return this.dxfData;
    }
    // Try to restore from localStorage
    const savedData = localStorage.getItem('dxfData');
    if (savedData) {
      this.dxfData = savedData;
    }
    return this.dxfData;
  },

  clearDxfData() {
    this.dxfData = null;
    localStorage.removeItem('dxfData');
  },
};
