import { AppState } from "../../scripts/app_state.js";
import { FrameSelector } from "./frame_selector.js";
import { ApiService } from "../../scripts/api.js";
import { authController } from "../../scripts/controllers/AuthController.js";
// Get DOM elements
const imageElement = document.getElementById("corner-image");
const imageContainer = document.querySelector(".image-container");
const noImageMessage = document.querySelector(".no-image-message");
const continueButton = document.querySelector(".control-button.primary");
const drawerWidthInput = document.getElementById("drawer-width");
const drawerHeightInput = document.getElementById("drawer-height");
let frameSelector = null;

// Initialize AuthController
document.addEventListener("DOMContentLoaded", async () => {
  // Initialize auth controller
  await authController.init();
});

// Function to validate drawer dimensions
function validateDrawerDimensions() {
  const width = drawerWidthInput.value;
  const height = drawerHeightInput.value;

  // Check if both values are present and within valid range
  const isValid =
    width &&
    height &&
    width >= 1 &&
    width <= 2000 &&
    height >= 1 &&
    height <= 2000;

  // Enable/disable continue button based on validation
  continueButton.disabled = !isValid;

  // Add/remove visual feedback classes
  if (isValid) {
    continueButton.classList.remove("disabled");
  } else {
    continueButton.classList.add("disabled");
  }

  return isValid;
}

// Function to load drawer dimensions from AppState
function loadDrawerDimensions() {
  const dimensions = AppState.getDrawerDimensions();
  if (dimensions && dimensions.width && dimensions.height) {
    // Only set values if they are valid numbers
    if (dimensions.width >= 1 && dimensions.width <= 2000) {
      drawerWidthInput.value = dimensions.width;
    }
    if (dimensions.height >= 1 && dimensions.height <= 2000) {
      drawerHeightInput.value = dimensions.height;
    }
  }
  // Initial validation of the continue button
  validateDrawerDimensions();
}

// Function to load image from AppState
function loadImageFromState() {
  const imageData = AppState.getCurrentImage();

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
        // Apply any saved transformations
        applyTransformations();
        // Initialize frame selector
        initializeFrameSelector();
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

// Function to apply all transformations
function applyTransformations() {
  const { rotation, mirrored } = AppState.getTransformations();

  // Calculate if we need to swap dimensions (for 90/270 degree rotations)
  const isSwapped = rotation % 180 !== 0;

  // Get container dimensions with some padding
  const containerWidth = imageContainer.clientWidth * 0.9; // 90% of container width
  const containerHeight = imageContainer.clientHeight * 0.9; // 90% of container height

  // Reset any existing transforms and dimensions to get natural size
  imageElement.style.transform = "translate(-50%, -50%)";
  imageElement.style.width = "auto";
  imageElement.style.height = "auto";

  // Wait for the natural dimensions to be available
  if (imageElement.naturalWidth > 0) {
    const imgWidth = imageElement.naturalWidth;
    const imgHeight = imageElement.naturalHeight;

    // Calculate scaling factors for both normal and rotated states
    const normalScaleX = containerWidth / imgWidth;
    const normalScaleY = containerHeight / imgHeight;
    const rotatedScaleX = containerWidth / imgHeight;
    const rotatedScaleY = containerHeight / imgWidth;

    // Choose the appropriate scale based on rotation
    let scale;
    if (isSwapped) {
      // Use the smaller scale factor to ensure image fits in both dimensions
      scale = Math.min(rotatedScaleX, rotatedScaleY);
    } else {
      scale = Math.min(normalScaleX, normalScaleY);
    }

    // Calculate final dimensions
    const finalWidth = imgWidth * scale;
    const finalHeight = imgHeight * scale;

    // Set the dimensions
    imageElement.style.width = `${finalWidth}px`;
    imageElement.style.height = `${finalHeight}px`;

    // Apply transformations with centering translation
    const transforms = [
      "translate(-50%, -50%)", // Center the image
      `rotate(${rotation}deg)`,
      mirrored ? "scaleX(-1)" : "scaleX(1)",
    ];

    imageElement.style.transform = transforms.join(" ");

    // Add the loaded class to enable transitions after initial positioning
    requestAnimationFrame(() => {
      imageElement.classList.add("loaded");
    });
  }
}

// Function to initialize frame selector
function initializeFrameSelector() {
  if (frameSelector) {
    frameSelector.hide();
  }
  frameSelector = new FrameSelector(imageElement);

  // Restore corner coordinates if they exist
  const savedCoordinates = AppState.getCornerCoordinates();
  if (savedCoordinates && savedCoordinates.length === 4) {
    frameSelector.setCornerPositions(savedCoordinates);
  }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  // Print entire AppState to console
  console.log("Current AppState:", AppState.getAllValues());

  loadImageFromState();
  loadDrawerDimensions();

  // Add input validation listeners
  drawerWidthInput.addEventListener("input", validateDrawerDimensions);
  drawerHeightInput.addEventListener("input", validateDrawerDimensions);
});

// Add resize listener to handle responsive updates
window.addEventListener("resize", () => {
  if (imageElement.style.display !== "none") {
    applyTransformations();
  }
});

// Add continue button click handler
continueButton.addEventListener("click", async () => {
  // Validate dimensions before proceeding
  if (!validateDrawerDimensions()) {
    return; // Don't proceed if validation fails
  }

  // Get drawer dimensions
  const drawerWidth = drawerWidthInput.value;
  const drawerHeight = drawerHeightInput.value;

  // Store drawer dimensions in AppState
  AppState.setDrawerDimensions(drawerWidth, drawerHeight);

  // Send to API for processing
  await ApiService.sendToAPI();
});
