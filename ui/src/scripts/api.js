/**
 * Manages communication with the backend server for image processing
 */
import { appState } from "./state.js";
import { renderer } from "./renderer.js";
import { controls } from "./controls.js";

const API_BASE_URL = "http://localhost:5000";
const PROCESSING_TIMEOUT = 30000;

export const apiService = {
  /**
   * Validates if the request can be sent to the API
   * @returns {boolean} True if valid, false otherwise
   */
  validateRequest: () => {
    if (!appState.coordinates || appState.coordinates.length !== 4) {
      renderer.showMessage("Please place 4 dots on the image", true);
      return false;
    }
    return true;
  },

  /**
   * Updates the UI to show processing state
   * @param {boolean} isProcessing Whether processing is starting or ending
   */
  updateProcessingUI: (isProcessing) => {
    const continueButton = document.querySelector(".control-button.primary");
    if (continueButton) {
      continueButton.disabled = isProcessing;
      continueButton.querySelector("span").textContent = isProcessing
        ? "Processing..."
        : "Submit";
    }
  },

  /**
   * Logs the request payload for debugging
   */
  logRequest: () => {
    console.log("Sending to API:", {
      imageData: appState.imageData,
      coordinates: appState.coordinates,
      transformations: appState.getTransformations(),
      realWidthMm: appState.realWidthMm,
      realHeightMm: appState.realHeightMm,
      edgeDetectionSettings: appState.edgeDetectionSettings,
    });
  },

  /**
   * Handles successful API response
   * @param {Object} data The response data from the API
   */
  handleSuccess: (data) => {
    // Clear any existing CSS transformations before setting the new image
    renderer.imageElement.style.transform = "";
    renderer.imageElement.style.maxWidth = "1280px";
    renderer.imageElement.style.maxHeight = "720px";

    renderer.imageElement.src = data.contouredImage;
    appState.setImageData(data.contouredImage);
    appState.updateRatios(data.xRatio, data.yRatio);

    // Reset transformation state since the API response image
    // already has these transformations applied
    appState.currentRotation = 0;
    appState.isMirrored = false;

    // Switch to edge detection step
    controls.switchToStep3();
  },

  /**
   * Handles API errors
   * @param {Error} error The error that occurred
   */
  handleError: (error) => {
    console.error("API Error:", error);
    renderer.showMessage(`Failed to process image: ${error.message}`, true);
  },

  /**
   * Sends the image processing request to the API
   * @returns {Promise<void>}
   */
  sendToAPI: async () => {
    if (!apiService.validateRequest()) return;

    try {
      apiService.updateProcessingUI(true);
      apiService.logRequest();

      const response = await fetch(`${API_BASE_URL}/process-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData: appState.imageData,
          coordinates: appState.coordinates,
          transformations: appState.getTransformations(),
          realWidthMm: appState.realWidthMm,
          realHeightMm: appState.realHeightMm,
          edgeDetectionSettings: appState.edgeDetectionSettings,
        }),
        timeout: PROCESSING_TIMEOUT,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (data.success) {
        apiService.handleSuccess(data);
      } else {
        throw new Error(data.error || "Unknown error occurred");
      }
    } catch (error) {
      apiService.handleError(error);
    } finally {
      apiService.updateProcessingUI(false);
    }
  },
};

// Maintain backward compatibility
export async function sendToAPI() {
  return apiService.sendToAPI();
}
