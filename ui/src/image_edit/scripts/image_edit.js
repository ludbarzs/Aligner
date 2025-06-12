import { AppState } from "../../scripts/app_state.js";
import { authController } from "../../scripts/controllers/AuthController.js";


const imageElement = document.getElementById("edit-image");
const editContainer = document.querySelector(".edit-container");
const noImageMessage = document.querySelector(".no-image-message");
const buttons = document.querySelectorAll(".control-button");
let rotateButton, mirrorButton, reuploadButton;

const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = '.jpg,.jpeg,.png';
fileInput.style.display = 'none';
fileInput.id = 'reupload-input';
document.body.appendChild(fileInput);

document.addEventListener("DOMContentLoaded", async () => {
  await authController.init();
  loadImageFromState();
  buttons.forEach((button) => button.style.display = "flex");
});

// Find the rotate, mirror, and reupload buttons by their text content
buttons.forEach((button) => {
  const span = button.querySelector("span");
  if (span) {
    if (span.textContent === "Rotate") {
      rotateButton = button;
    } else if (span.textContent === "Mirror") {
      mirrorButton = button;
    } else if (span.textContent === "Reupload") {
      reuploadButton = button;
    }
  }
});

// Handle file reupload
function handleReupload(file) {
  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file');
    return;
  }

  const reader = new FileReader();
  
  reader.onload = function(e) {
    // Save new image to app state
    AppState.setCurrentImage(e.target.result);
    window.location.reload();
  };
  
  reader.onerror = function() {
    alert('Error reading file');
  };
  
  reader.readAsDataURL(file);
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
  
  // Get container dimensions with some padding
  const containerWidth = editContainer.clientWidth * 0.9;
  const containerHeight = editContainer.clientHeight * 0.9;
  
  // Reset any existing transforms and dimensions to get natural size
  imageElement.style.transform = 'translate(-50%, -50%)';
  imageElement.style.width = 'auto';
  imageElement.style.height = 'auto';
  
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
    
    // Apply transformations
    const transforms = [
      'translate(-50%, -50%)', // Center the image
      `rotate(${rotation}deg)`,
      mirrored ? 'scaleX(-1)' : 'scaleX(1)'
    ];
    
    imageElement.style.transform = transforms.join(' ');
    
    requestAnimationFrame(() => {
      imageElement.classList.add('loaded');
    });
  }
}

if (rotateButton) {
  rotateButton.addEventListener("click", rotateImage);
}
if (mirrorButton) {
  mirrorButton.addEventListener("click", mirrorImage);
}
if (reuploadButton) {
  reuploadButton.addEventListener("click", () => {
    fileInput.click();
  });
}

// Handle file selection
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    handleReupload(file);
  }
});

// Add resize listener to handle responsive updates
window.addEventListener('resize', () => {
  if (imageElement.style.display !== 'none') {
    applyTransformations();
  }
});

// Get the continue button
const continueButton = document.querySelector('.control-button.primary');

// Add click event listener to continue button
continueButton.addEventListener('click', () => {
    window.location.href = '../corner_selection/corner_selection.html';
});
