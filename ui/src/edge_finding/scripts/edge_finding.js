import { AppState } from "../../scripts/app_state.js";
import { ApiService } from "../../scripts/api.js";

// Get DOM elements
const imageElement = document.getElementById("edge-image");
const imageContainer = document.querySelector(".image-container");
const noImageMessage = document.querySelector(".no-image-message");
const exportButton = document.querySelector(".control-button.primary");

// Get edge detection settings elements
const blurSetting = document.getElementById("blur-setting");
const edgeLow = document.getElementById("edge-low");
const edgeHigh = document.getElementById("edge-high");

// Function to load image from AppState
function loadImageFromState() {
  const imageData = AppState.getContouredImage();

  if (imageData) {
    try {
      // Display the image
      imageElement.src = imageData;
      imageElement.style.display = "block";

      if (noImageMessage) {
        noImageMessage.style.display = "none";
      }

      // Add error handler for image loading failures
      imageElement.onerror = () => {
        console.error("Failed to load image data");
        handleNoImage("Failed to load image. Please try uploading again.");
      };

      // Initialize image once loaded
      imageElement.onload = () => {
        imageElement.classList.add('loaded');
      };
    } catch (error) {
      console.error("Error setting up image:", error);
      handleNoImage("Error loading image. Please try uploading again.");
    }
  } else {
    handleNoImage("No image found. Please upload an image first.");
  }
}

// Handle case where no image is available
function handleNoImage(message) {
  if (noImageMessage) {
    noImageMessage.textContent = message;
    noImageMessage.style.display = "block";
  }
  if (imageElement) {
    imageElement.style.display = "none";
  }

  // Redirect back to upload page after a short delay
  setTimeout(() => {
    window.location.href = "../image_upload/image_upload.html";
  }, 2000);
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  loadImageFromState();
});

// Add edge detection settings change handlers
[blurSetting, edgeLow, edgeHigh].forEach(input => {
  if (input) {
    input.addEventListener('change', async () => {
      // Get current settings
      const settings = {
        blurKernelSize: [parseInt(blurSetting.value), parseInt(blurSetting.value)],
        cannyLow: parseInt(edgeLow.value),
        cannyHigh: parseInt(edgeHigh.value),
        morphKernelSize: [5, 5], // Keep this fixed for now
        edgeThreshold: 80 // Keep this fixed for now
      };

      // Update edge detection settings in AppState
      AppState.setEdgeDetectionSettings(settings);

      // Send to API for processing
      await ApiService.sendToAPI();
    });
  }
}); 