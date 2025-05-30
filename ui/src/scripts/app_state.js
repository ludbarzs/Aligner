/**
 * Manages application state and provides methods to interact with it
 */
export class AppState {
  // Coordinates methods
  static setCornerCoordinates(coordinates) {
    localStorage.setItem("coordinates", JSON.stringify(coordinates));
  }

  static getCornerCoordinates() {
    const saved = localStorage.getItem("coordinates");
    return saved ? JSON.parse(saved) : [];
  }

  static clearCornerCoordinates() {
    localStorage.removeItem("coordinates");
  }

  // Transformation methods
  static setRotation(degrees) {
    localStorage.setItem("rotation", degrees.toString());
  }

  static getRotation() {
    const saved = localStorage.getItem("rotation");
    return saved ? parseInt(saved, 10) : 0;
  }

  static setMirrored(isMirrored) {
    localStorage.setItem("isMirrored", isMirrored.toString());
  }

  static getMirrored() {
    const saved = localStorage.getItem("isMirrored");
    return saved ? saved === "true" : false;
  }

  static getTransformations() {
    return {
      rotation: AppState.getRotation(),
      mirrored: AppState.getMirrored(),
    };
  }

  static resetTransformations() {
    localStorage.removeItem("rotation");
    localStorage.removeItem("isMirrored");
    AppState.clearCornerCoordinates();
  }

  // Image methods
  static setCurrentImage(imageData) {
    localStorage.setItem("currentImage", imageData);
    AppState.resetTransformations();
  }

  static getCurrentImage() {
    return localStorage.getItem("currentImage");
  }

  static clearCurrentImage() {
    localStorage.removeItem("currentImage");
    AppState.resetTransformations();
  }

  // Drawer dimensions methods
  static setDrawerDimensions(width, height) {
    localStorage.setItem("drawerWidth", width.toString());
    localStorage.setItem("drawerHeight", height.toString());
  }

  static getDrawerDimensions() {
    const savedWidth = localStorage.getItem("drawerWidth");
    const savedHeight = localStorage.getItem("drawerHeight");
    return {
      width: savedWidth ? parseInt(savedWidth) : null,
      height: savedHeight ? parseInt(savedHeight) : null,
    };
  }

  // Edge detection settings methods
  static setEdgeDetectionSettings(settings) {
    localStorage.setItem("edgeDetectionSettings", JSON.stringify(settings));
  }

  static getEdgeDetectionSettings() {
    const saved = localStorage.getItem("edgeDetectionSettings");
    return saved ? JSON.parse(saved) : null;
  }

  // Contoured image methods
  static setContouredImage(imageData) {
    localStorage.setItem("contouredImage", imageData);
  }

  static getContouredImage() {
    return localStorage.getItem("contouredImage");
  }

  static clearContouredImage() {
    localStorage.removeItem("contouredImage");
  }

  // DXF data methods
  static setDxfData(data) {
    localStorage.setItem("dxfData", data);
  }

  static getDxfData() {
    return localStorage.getItem("dxfData");
  }

  static clearDxfData() {
    localStorage.removeItem("dxfData");
  }

  // Processed image methods
  static setProcessedImage(imageData) {
    localStorage.setItem("processedImage", imageData);
  }

  static getProcessedImage() {
    return localStorage.getItem("processedImage");
  }

  static clearProcessedImage() {
    localStorage.removeItem("processedImage");
  }

  // Clear all stored data
  static clearCache() {
    localStorage.removeItem("coordinates");
    localStorage.removeItem("rotation");
    localStorage.removeItem("isMirrored");
    localStorage.removeItem("currentImage");
    localStorage.removeItem("drawerWidth");
    localStorage.removeItem("drawerHeight");
    localStorage.removeItem("edgeDetectionSettings");
    localStorage.removeItem("contouredImage");
    localStorage.removeItem("dxfData");
    localStorage.removeItem("processedImage");
  }
}
