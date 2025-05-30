/**
 * Manages communication with the backend server for image processing
 */
import { AppState } from "./app_state.js";

const API_BASE_URL = "http://localhost:5000";
const PROCESSING_TIMEOUT = 30000;

// Default edge detection settings
const DEFAULT_EDGE_DETECTION_SETTINGS = {
  blurKernelSize: [5, 5],
  cannyLow: 30,
  cannyHigh: 130,
  morphKernelSize: [5, 5]
};

export const ApiService = {
  /**
   * Validates if the request can be sent to the API
   * @returns {boolean} True if valid, false otherwise
   */
  validateRequest() {
    // Skip corner coordinate validation if we're in edge finding view
    const isEdgeFinding = window.location.href.includes('edge_finding');
    
    if (!isEdgeFinding) {
      const coordinates = AppState.getCornerCoordinates();
      if (!coordinates || coordinates.length !== 4) {
        this.showError("Please place 4 dots on the image");
        return false;
      }
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
      const isEdgeFinding = window.location.href.includes('edge_finding');
      
      // Get the appropriate image data based on the current mode
      let imageData;
      if (isEdgeFinding) {
        imageData = AppState.getProcessedImage();
        if (!imageData) {
          throw new Error("No processed image available");
        }
      } else {
        imageData = AppState.getCurrentImage();
        if (!imageData) {
          throw new Error("No image uploaded");
        }
      }
      
      // Get edge detection settings or use defaults if none exist
      const edgeDetectionSettings = AppState.getEdgeDetectionSettings() || DEFAULT_EDGE_DETECTION_SETTINGS;
      
      // If we're not in edge finding mode and there are no settings saved, save the defaults
      if (!isEdgeFinding && !AppState.getEdgeDetectionSettings()) {
        AppState.setEdgeDetectionSettings(DEFAULT_EDGE_DETECTION_SETTINGS);
      }
      
      // Prepare request body
      const requestBody = {
        imageData: imageData,
        transformations: {
          rotation: AppState.getRotation(),
          mirrored: AppState.getMirrored()
        },
        realWidthMm: drawerWidth,
        realHeightMm: drawerHeight,
        edgeDetectionSettings: edgeDetectionSettings
      };

      // Only include coordinates if not in edge finding mode
      if (!isEdgeFinding) {
        requestBody.coordinates = AppState.getCornerCoordinates();
      }

      // Log the request body for debugging (excluding image data)
      const debugBody = { ...requestBody, imageData: 'data:image/...[truncated]' };
      console.log('Sending request with:', debugBody);

      const response = await fetch(`${API_BASE_URL}/process-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Store the processed and contoured images in AppState
        AppState.setProcessedImage(data.processedImage);
        AppState.setContouredImage(data.contouredImage);
        
        // Store DXF data if available
        if (data.dxf_data) {
          AppState.setDxfData(data.dxf_data);
        }
        
        // Only redirect if not already in edge finding view
        if (!isEdgeFinding) {
          window.location.href = '../edge_finding/edge_finding.html';
        }
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
