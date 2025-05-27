import { AppState } from "../../scripts/app_state.js";

// Get DOM elements
const imageElement = document.getElementById("edit-image");
const editContainer = document.querySelector(".edit-container");
const noImageMessage = document.querySelector(".no-image-message");
const buttons = document.querySelectorAll(".control-button");
let rotateButton, mirrorButton;

// Find the rotate and mirror buttons by their text content
buttons.forEach((button) => {
  const span = button.querySelector("span");
  if (span) {
    if (span.textContent === "Rotate") {
      rotateButton = button;
    } else if (span.textContent === "Mirror") {
      mirrorButton = button;
    }
  }
});

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

      // Enable edit container if it exists
      if (editContainer) {
        editContainer.style.display = "block";
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
  if (editContainer) {
    editContainer.style.display = "none";
  }

  // Redirect back to upload page after a short delay
  setTimeout(() => {
    window.location.href = "../image_upload/image_upload.html";
  }, 2000);
}

// Function to rotate the image
function rotateImage() {
  const currentRotation = AppState.getTransformations().rotation;
  // Add 90 degrees and normalize to 0-360
  const newRotation = (currentRotation + 90) % 360;
  AppState.setRotation(newRotation);
  applyTransformations();
}

// Function to mirror the image
function mirrorImage() {
  const currentMirror = AppState.getTransformations().mirrored;
  AppState.setMirrored(!currentMirror);
  applyTransformations();
}

// Function to apply all transformations
function applyTransformations() {
  const { rotation, mirrored } = AppState.getTransformations();
  
  // Calculate if we need to swap dimensions (for 90/270 degree rotations)
  const isSwapped = rotation % 180 !== 0;
  
  // Get container dimensions
  const containerWidth = editContainer.clientWidth;
  const containerHeight = editContainer.clientHeight;
  
  // Reset image dimensions
  imageElement.style.width = 'auto';
  imageElement.style.height = 'auto';
  
  // Wait for the natural dimensions to be available
  if (imageElement.naturalWidth > 0) {
    const imgRatio = imageElement.naturalWidth / imageElement.naturalHeight;
    const containerRatio = isSwapped ? 
      containerHeight / containerWidth : 
      containerWidth / containerHeight;
    
    if (imgRatio > containerRatio) {
      // Image is wider relative to container
      if (isSwapped) {
        imageElement.style.height = '90%';
        imageElement.style.width = 'auto';
      } else {
        imageElement.style.width = '90%';
        imageElement.style.height = 'auto';
      }
    } else {
      // Image is taller relative to container
      if (isSwapped) {
        imageElement.style.width = '90%';
        imageElement.style.height = 'auto';
      } else {
        imageElement.style.height = '90%';
        imageElement.style.width = 'auto';
      }
    }
  }
  
  // Apply transformations
  const transforms = [
    `rotate(${rotation}deg)`,
    mirrored ? 'scaleX(-1)' : 'scaleX(1)'
  ];
  
  imageElement.style.transform = transforms.join(' ');
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  loadImageFromState();

  // Make buttons visible
  buttons.forEach((button) => {
    button.style.display = "flex";
  });
});

if (rotateButton) {
  rotateButton.addEventListener("click", rotateImage);
}
if (mirrorButton) {
  mirrorButton.addEventListener("click", mirrorImage);
}

// Add resize listener to handle responsive updates
window.addEventListener('resize', () => {
  if (imageElement.style.display !== 'none') {
    applyTransformations();
  }
});
