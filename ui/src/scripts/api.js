/**
 * Manages communication with the backend server
 */
import { appState } from "./state.js";
import { renderer } from "./renderer.js";

const API_BASE_URL = "http://localhost:5000";

export async function sendToAPI() {
  if (!appState.coordinates || appState.coordinates.length !== 4) {
    renderer.showMessage("Please place 4 dots on the image", true);
    return;
  }

  const continueButton = document.querySelector(".control-button.primary");
  if (continueButton) {
    continueButton.disabled = true;
    continueButton.querySelector("span").textContent = "Processing...";
  }

  try {
    const response = await fetch(`${API_BASE_URL}/process-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageData: appState.imageData,
        coordinates: appState.coordinates,
        transformations: appState.getTransformations(),
        realWidthMm: appState.realWidthMm,
        realHeightMm: appState.realHeightMm,
      }),
      timeout: 30000,
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    console.log(data);
    if (data.success) {
      renderer.imageElement.src = data.processedImage;
      appState.setImageData(data.processedImage);
      appState.updateRatios(data.xRatio, data.yRatio);
    } else {
      throw new Error(data.error || "Unknown error occurred");
    }
  } catch (error) {
    console.error("API Error:", error);
    renderer.showMessage(`Failed to process image: ${error.message}`, true);
  } finally {
    if (continueButton) {
      continueButton.disabled = false;
      continueButton.querySelector("span").textContent = "Submit";
    }
  }
}
