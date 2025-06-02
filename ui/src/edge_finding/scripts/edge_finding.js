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

// Handle save settings visibility
const saveSettingsContainer = document.querySelector(
  ".save-settings-container",
);

// Add API base URL constant at the top of the file
const API_BASE_URL = 'http://localhost:3000';

// Default settings values
const DEFAULT_SETTINGS = {
  blur: 5,
  sensitivity: 130,
  closing: 5
};

// Initialize AuthController
document.addEventListener("DOMContentLoaded", async () => {
  // Initialize auth controller
  await authController.init();
  // Check visibility after auth is initialized
  updateSaveSettingsVisibility();
});

// Listen for auth state changes
window.addEventListener("authStateChanged", () => {
  updateSaveSettingsVisibility();
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
      // Show the image container first
      if (imageContainer) {
        imageContainer.style.display = "flex";
      }

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
  if (imageContainer) {
    imageContainer.style.display = "none";
  }

  // Redirect back to upload page after a short delay
  setTimeout(() => {
    window.location.href = "../image_upload/image_upload.html";
  }, 2000);
}

// Event Listeners
document.addEventListener("DOMContentLoaded", async () => {
  loadImageFromState();
  loadSavedSettings();
  
  // Load user settings if authenticated
  if (authController.isAuthenticated()) {
    await loadUserSettings();
  }
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

      // Save settings if checkbox is checked
      const checkbox = document.getElementById("save-settings-checkbox");
      if (checkbox && checkbox.checked) {
        await saveUserSettings();
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
        const savedImage = await ImageController.saveCurrentState(
          currentUser.$id,
        );
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

// Function to check if user is logged in and show/hide save settings
function updateSaveSettingsVisibility() {
  if (!saveSettingsContainer) return; // Guard against null
  
  const isLoggedIn = authController.isAuthenticated();
  saveSettingsContainer.style.display = isLoggedIn ? "flex" : "none";
}

// Handle save settings checkbox changes
const saveSettingsCheckbox = document.getElementById("save-settings-checkbox");
if (saveSettingsCheckbox) {
  saveSettingsCheckbox.addEventListener("change", async (e) => {
    if (e.target.checked) {
      await saveUserSettings();
    }
  });
}

// Function to save user settings
async function saveUserSettings() {
  try {
    const currentUser = authController.getCurrentUser();
    if (!currentUser) {
      console.error('No user logged in');
      return;
    }

    const settings = {
      userId: currentUser.$id,
      gaussianBlur: parseInt(document.getElementById("blur-setting").value),
      cannyThreshold1: Math.floor(parseInt(document.getElementById("edge-sensitivity").value) / 3),
      cannyThreshold2: parseInt(document.getElementById("edge-sensitivity").value),
      morphKernelSize: parseInt(document.getElementById("edge-closing").value)
    };

    const response = await fetch(`${API_BASE_URL}/api/preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings)
    });

    if (!response.ok) {
      throw new Error('Failed to save preferences');
    }

    const savedSettings = await response.json();
    console.log('Settings saved successfully:', savedSettings);
  } catch (error) {
    console.error('Error saving settings:', error);
    // Uncheck the checkbox if save failed
    const checkbox = document.getElementById("save-settings-checkbox");
    if (checkbox) {
      checkbox.checked = false;
    }
  }
}

// Function to load user settings
async function loadUserSettings() {
  try {
    const currentUser = authController.getCurrentUser();
    if (!currentUser) {
      return;
    }

    const response = await fetch(`${API_BASE_URL}/api/preferences/user/${currentUser.$id}`);
    if (!response.ok) {
      if (response.status !== 404) { // 404 is expected when no settings exist
        throw new Error('Failed to load preferences');
      }
      return;
    }

    const settings = await response.json();
    
    // Update the UI with loaded settings
    document.getElementById("blur-setting").value = settings.gaussian_blur;
    document.getElementById("blur-value").textContent = settings.gaussian_blur;
    
    document.getElementById("edge-sensitivity").value = settings.canny_threshold_2;
    document.getElementById("sensitivity-value").textContent = settings.canny_threshold_2;
    
    document.getElementById("edge-closing").value = settings.morph_kernel_size;
    document.getElementById("closing-value").textContent = settings.morph_kernel_size;

    // Check the save settings checkbox
    const checkbox = document.getElementById("save-settings-checkbox");
    if (checkbox) {
      checkbox.checked = true;
    }

    // Update edge detection with loaded settings
    await updateEdgeDetection();
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Add reset button functionality
const resetButton = document.querySelector('.reset-settings-button');
resetButton.addEventListener('click', () => {
  // Reset blur setting
  const blurInput = document.getElementById('blur-setting');
  const blurValue = document.getElementById('blur-value');
  blurInput.value = DEFAULT_SETTINGS.blur;
  blurValue.textContent = DEFAULT_SETTINGS.blur;

  // Reset edge sensitivity setting
  const sensitivityInput = document.getElementById('edge-sensitivity');
  const sensitivityValue = document.getElementById('sensitivity-value');
  sensitivityInput.value = DEFAULT_SETTINGS.sensitivity;
  sensitivityValue.textContent = DEFAULT_SETTINGS.sensitivity;

  // Reset edge closing setting
  const closingInput = document.getElementById('edge-closing');
  const closingValue = document.getElementById('closing-value');
  closingInput.value = DEFAULT_SETTINGS.closing;
  closingValue.textContent = DEFAULT_SETTINGS.closing;

  // Trigger edge detection with new settings
  updateEdgeDetection();
});
