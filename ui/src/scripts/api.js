/**
 * Manages communication with the backend server for image processing
 */
import { AppState } from "./app_state.js";

const API_BASE_URL = "http://localhost:5000";
const PROCESSING_TIMEOUT = 30000;

export const ApiService = {
  /**
   * Validates if the request can be sent to the API
   * @returns {boolean} True if valid, false otherwise
   */
  validateRequest() {
    const coordinates = AppState.getCornerCoordinates();
    if (!coordinates || coordinates.length !== 4) {
      this.showError("Please place 4 dots on the image");
      return false;
    }
    return true;
  },

  /**
   * Shows error message to the user
   * @param {string} message Error message to display
   */
  showError(message) {
    // You can implement custom error display logic here
    console.error(message);
    alert(message); // Temporary solution - replace with proper UI notification
  },

  /**
   * Updates the UI to show processing state
   * @param {boolean} isProcessing Whether processing is starting or ending
   */
  updateProcessingUI(isProcessing) {
    const continueButton = document.querySelector(".control-button.primary");
    if (continueButton) {
      continueButton.disabled = isProcessing;
      continueButton.querySelector("span").textContent = isProcessing
        ? "Processing..."
        : "Continue";
    }
  },

  /**
   * Sends the image processing request to the API
   * @returns {Promise<void>}
   */
  async sendToAPI() {
    if (!this.validateRequest()) return;

    try {
      this.updateProcessingUI(true);
      
      const { width: drawerWidth, height: drawerHeight } = AppState.getDrawerDimensions();
      
      const response = await fetch(`${API_BASE_URL}/process-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData: AppState.getCurrentImage(),
          coordinates: AppState.getCornerCoordinates(),
          transformations: {
            rotation: AppState.currentRotation,
            mirrored: AppState.isMirrored
          },
          realWidthMm: drawerWidth,
          realHeightMm: drawerHeight,
          edgeDetectionSettings: AppState.getEdgeDetectionSettings()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Store both the processed and contoured images in AppState
        AppState.setCurrentImage(data.processedImage);
        AppState.setContouredImage(data.contouredImage);
        
        // Redirect to edge finding view
        window.location.href = '../edge_finding/edge_finding.html';
      } else {
        throw new Error(data.error || "Unknown error occurred");
      }
    } catch (error) {
      console.error("API Error:", error);
      this.showError(`Failed to process image: ${error.message}`);
    } finally {
      this.updateProcessingUI(false);
    }
  }
};

// Export a convenience function for backward compatibility
export async function sendToAPI() {
  return ApiService.sendToAPI();
}
