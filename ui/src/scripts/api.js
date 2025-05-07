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
  console.log("Before:");
  console.log({
    imageData: appState.imageData,
    coordinates: appState.coordinates,
    transformations: appState.getTransformations(),
    realWidthMm: appState.realWidthMm,
    realHeightMm: appState.realHeightMm,
  });
  console.log("After:");
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
      // Clear any existing CSS transformations before setting the new image
      renderer.imageElement.style.transform = "";
      renderer.imageElement.style.maxWidth = "1280px";
      renderer.imageElement.style.maxHeight = "720px";
      renderer.imageElement.src = data.processedImage;
      appState.setImageData(data.processedImage);
      appState.updateRatios(data.xRatio, data.yRatio);

      // Reset transformation state in appState since the API response
      // image already has these transformations applied
      appState.currentRotation = 0;
      appState.isMirrored = false;
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
