// controls.js - Handles image rotation, mirroring functionality and workflow

// Global variables for tracking image state
let currentRotation = 0;
let isMirrored = false;
let originalImageData = null;
let currentWorkflowStep = 1; // Step 1: Adjust image, Step 2: Place dots

// Initialize event listeners for control buttons once DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Get reference to the image element
  const imageElement = document.getElementById("uploaded-image");

  // Setup rotation button
  const rotateButton = document.querySelector(".control-button:nth-child(1)");
  rotateButton.addEventListener("click", () => rotateImage(imageElement));

  // Setup mirror button
  const mirrorButton = document.querySelector(".control-button:nth-child(2)");
  mirrorButton.addEventListener("click", () => mirrorImage(imageElement));

  // Setup reupload button
  const reuploadButton = document.querySelector(".control-button:nth-child(3)");
  reuploadButton.addEventListener("click", () => {
    document.getElementById("image-upload").click();
  });

  // Setup continue button
  const continueButton = document.querySelector(".control-button.primary");
  if (continueButton) {
    continueButton.addEventListener("click", () => {
      if (currentWorkflowStep === 1) {
        switchToStep2();
        // Update progress when continuing to step 2
        if (globalThis.progressTracker) {
          globalThis.progressTracker.nextStep();
        }
      } else {
        _sendToAPI();
        // Update progress when submitting
        if (globalThis.progressTracker) {
          globalThis.progressTracker.nextStep();
        }
      }
    });
  }
});

/**
 * Rotates the image 90 degrees clockwise
 * @param {HTMLImageElement} imageElement - The image to rotate
 */
function rotateImage(imageElement) {
  if (!imageElement.src || currentWorkflowStep !== 1) return;

  // Create a temporary image to get original dimensions
  const img = new Image();
  img.onload = function () {
    // Create a canvas for the rotation
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set canvas dimensions - swap width and height for 90/270 degree rotations
    canvas.width = img.height;
    canvas.height = img.width;

    // Update rotation value (add 90 degrees)
    currentRotation = (currentRotation + 90) % 360;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Move to the center of the canvas
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Rotate 90 degrees clockwise
    ctx.rotate(Math.PI / 2);

    // Apply mirror transformation if needed
    if (isMirrored) {
      ctx.scale(-1, 1);
    }

    // Draw the image centered and rotated
    ctx.drawImage(img, -img.width / 2, -img.height / 2);

    // Update the image source with the new rotated image
    imageElement.src = canvas.toDataURL("image/png");

    // Ensure the transformed image maintains proper display in the UI
    imageElement.style.maxHeight = "720px";
    imageElement.style.maxWidth = "1280px";
  };

  // Load the current image for transformation
  img.src = imageElement.src;
}

/**
 * Mirrors the image horizontally
 * @param {HTMLImageElement} imageElement - The image to mirror
 */
function mirrorImage(imageElement) {
  if (!imageElement.src || currentWorkflowStep !== 1) return;

  // Create a temporary image to get dimensions
  const img = new Image();
  img.onload = function () {
    // Create a canvas for the mirroring
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set canvas dimensions based on the current orientation
    if (currentRotation % 180 === 0) {
      // Normal orientation or 180 degree rotation
      canvas.width = img.width;
      canvas.height = img.height;
    } else {
      // 90 or 270 degree rotation
      canvas.width = img.height;
      canvas.height = img.width;
    }

    // Toggle mirrored state
    isMirrored = !isMirrored;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Apply transformations based on current rotation and mirror state
    if (currentRotation === 0) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    } else if (currentRotation === 90) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Math.PI / 2);
      ctx.scale(isMirrored ? 1 : -1, 1);
      ctx.translate(-canvas.height / 2, -canvas.width / 2);
    } else if (currentRotation === 180) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    } else if (currentRotation === 270) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.scale(isMirrored ? -1 : 1, 1);
      ctx.translate(-canvas.height / 2, -canvas.width / 2);
    }

    // Draw the image
    ctx.drawImage(img, 0, 0);

    // Restore context state
    ctx.restore();

    // Update the image source
    imageElement.src = canvas.toDataURL("image/png");

    // Ensure the transformed image maintains proper display in the UI
    imageElement.style.maxHeight = "720px";
    imageElement.style.maxWidth = "1280px";
  };

  // Load the current image for transformation
  img.src = imageElement.src;
}

/**
 * Gets the processed image data for sending to the API
 * @returns {string} - The processed image data URL
 */
function getProcessedImageData() {
  return document.getElementById("uploaded-image").src;
}

/**
 * Switch to step 2 - dot placement mode
 */
function switchToStep2() {
  currentWorkflowStep = 2;

  // Change button labels
  const controlButtons = document.querySelectorAll(".control-button");

  // Hide first three buttons (rotate, mirror, reupload)
  for (let i = 0; i < 3; i++) {
    if (controlButtons[i]) {
      controlButtons[i].classList.remove("flex");
    }
  }

  // Create back button to replace them
  const backButton = document.createElement("button");
  backButton.className = "control-button flex";
  backButton.innerHTML = "<span>Back</span>";
  backButton.addEventListener("click", switchToStep1);

  // Get the controls container and insert the back button at the beginning
  const controlsContainer = document.querySelector(".controls");
  controlsContainer.insertBefore(backButton, controlsContainer.firstChild);

  // Change continue button text to "Submit"
  const continueButton = document.querySelector(".control-button.primary");
  if (continueButton) {
    continueButton.querySelector("span").textContent = "Submit";
  }

  // Enable dot placement by setting a flag that renderer.js can check
  window.allowDotPlacement = true;

  // Clear any existing dots
  if (typeof removeAllMarkers === "function") {
    removeAllMarkers();
  }
  if (typeof coordinates !== "undefined") {
    coordinates = [];
  }
  if (typeof updateCoordinateList === "function") {
    updateCoordinateList();
  }

  // Display instruction to user
  const instructionElement = document.createElement("div");
  instructionElement.id = "placement-instruction";
  instructionElement.className = "placement-instruction";
  instructionElement.textContent = "Click to place up to 4 points on the image";
  document.body.appendChild(instructionElement);
}

/**
 * Switch back to step 1 - image adjustment mode
 */
function switchToStep1() {
  currentWorkflowStep = 1;

  // Remove the back button
  const backButton = document.querySelector(
    ".controls .control-button:first-child",
  );
  if (backButton) {
    backButton.remove();
  }

  // Show the original three buttons
  const controlButtons = document.querySelectorAll(".control-button");
  for (let i = 0; i < 3; i++) {
    if (controlButtons[i]) {
      controlButtons[i].classList.add("flex");
    }
  }

  // Change continue button text back to "Continue"
  const continueButton = document.querySelector(".control-button.primary");
  if (continueButton) {
    continueButton.querySelector("span").textContent = "Continue";
  }

  // Disable dot placement
  window.allowDotPlacement = false;

  // Remove any placed dots
  if (typeof removeAllMarkers === "function") {
    removeAllMarkers();
  }
  if (typeof coordinates !== "undefined") {
    coordinates = [];
  }
  if (typeof updateCoordinateList === "function") {
    updateCoordinateList();
  }

  // Remove instruction element
  const instructionElement = document.getElementById("placement-instruction");
  if (instructionElement) {
    instructionElement.remove();
  }

  // Move progress bar back one step
  if (window.progressTracker) {
    window.progressTracker.previousStep();
  }
}
