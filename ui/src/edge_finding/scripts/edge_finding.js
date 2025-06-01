import { AppState } from "../../scripts/app_state.js";
import { ApiService } from "../../scripts/api.js";
import { ImageController } from "../../scripts/controllers/image_controller.js";
import { authController } from "../../scripts/controllers/AuthController.js";

// Get DOM elements
const imageElement = document.getElementById("edge-image");
const imageContainer = document.querySelector(".image-container");
const noImageMessage = document.querySelector(".no-image-message");
const exportButton = document.querySelector(".control-button.primary");

// Get edge detection settings elements
const blurSetting = document.getElementById("blur-setting");
const edgeSensitivity = document.getElementById("edge-sensitivity");
const edgeClosing = document.getElementById("edge-closing");

// Get value display elements
const blurValue = document.getElementById("blur-value");
const sensitivityValue = document.getElementById("sensitivity-value");
const closingValue = document.getElementById("closing-value");

// Define closing steps for snapping
const closingSteps = [1, 3, 5, 8, 11, 13, 16];

// Initialize AuthController
document.addEventListener("DOMContentLoaded", async () => {
  // Initialize auth controller
  await authController.init();
});

// Function to find nearest step value
function findNearestStep(value, steps) {
  return steps.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev,
  );
}

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
        imageElement.classList.add("loaded");
      };
    } catch (error) {
      console.error("Error setting up image:", error);
      handleNoImage("Error loading image. Please try uploading again.");
    }
  } else {
    handleNoImage("No image found. Please upload an image first.");
  }
}

// Function to load saved edge detection settings
function loadSavedSettings() {
  const settings = AppState.getEdgeDetectionSettings();
  if (settings) {
    // Update blur setting
    if (settings.blurKernelSize && settings.blurKernelSize[0]) {
      const blurVal = settings.blurKernelSize[0];
      blurSetting.value = blurVal;
      blurValue.textContent = blurVal;
    }

    // Update edge sensitivity
    if (settings.cannyHigh) {
      const sensitivityVal = settings.cannyHigh;
      edgeSensitivity.value = sensitivityVal;
      sensitivityValue.textContent = sensitivityVal;
    }

    // Update edge closing
    if (settings.morphKernelSize && settings.morphKernelSize[0]) {
      const closingVal = findNearestStep(
        settings.morphKernelSize[0],
        closingSteps,
      );
      edgeClosing.value = closingVal;
      closingValue.textContent = closingVal;
    }
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
  loadSavedSettings();
});

// Add edge detection settings change handlers
[blurSetting, edgeSensitivity, edgeClosing].forEach((input) => {
  if (input) {
    // Update value display on input (while sliding)
    input.addEventListener("input", () => {
      const value = parseInt(input.value);

      switch (input.id) {
        case "blur-setting":
          blurValue.textContent = value;
          break;
        case "edge-sensitivity":
          sensitivityValue.textContent = value;
          break;
        case "edge-closing":
          const snappedValue = findNearestStep(value, closingSteps);
          closingValue.textContent = snappedValue;
          break;
      }
    });

    // Handle actual value change
    input.addEventListener("change", async () => {
      let blurVal = parseInt(blurSetting.value);
      let sensitivityVal = parseInt(edgeSensitivity.value);
      let closingVal = parseInt(edgeClosing.value);

      // Snap closing value to nearest step
      closingVal = findNearestStep(closingVal, closingSteps);
      edgeClosing.value = closingVal;
      closingValue.textContent = closingVal;

      const settings = {
        blurKernelSize: [blurVal, blurVal],
        cannyLow: Math.floor(sensitivityVal / 3), // Low threshold is 1/3 of high threshold
        cannyHigh: sensitivityVal,
        morphKernelSize: [closingVal, closingVal],
      };

      // Update edge detection settings in AppState
      AppState.setEdgeDetectionSettings(settings);

      try {
        // Show loading state
        if (imageElement) {
          imageElement.style.opacity = "0.5";
        }

        // Send to API for processing
        await ApiService.sendToAPI();

        // Update the image with the new contoured image
        const contouredImage = AppState.getContouredImage();
        if (contouredImage && imageElement) {
          imageElement.src = contouredImage;
          imageElement.style.opacity = "1";
        }
      } catch (error) {
        console.error("Failed to update edge detection:", error);
        // Reset opacity if there was an error
        if (imageElement) {
          imageElement.style.opacity = "1";
        }
      }
    });
  }
});

// Add export button click handler
if (exportButton) {
  exportButton.addEventListener("click", async () => {
    try {
      // First send final data to API for processing
      await ApiService.sendToAPI();

      // Only save to database if user is authenticated
      if (authController.isAuthenticated()) {
        const currentUser = authController.getCurrentUser();
        const savedImage = await ImageController.saveCurrentState(currentUser.$id);
        console.log("Image state saved successfully:", savedImage);
      }

      // Navigate to export page
      window.location.href = "../export/export.html";
    } catch (error) {
      console.error("Failed to save or process data:", error);
      alert("Failed to save data. Please try again.");
    }
  });
}

