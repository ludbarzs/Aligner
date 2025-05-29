import { AppState } from "../../scripts/app_state.js";
import { initializeDragAndDrop } from "./drag_and_drop.js";

// Get the file input element
const fileInput = document.getElementById("image-upload");
const uploadButton = document.querySelector(".upload-button");
const container = document.querySelector(".container");

// Initialize auth buttons
const loginButton = document.querySelector(".login-button");
const signupButton = document.querySelector(".signup-button");

loginButton.addEventListener("click", () => {
  window.location.href = "../authentication/login.html";
});

signupButton.addEventListener("click", () => {
  window.location.href = "../authentication/register.html";
});

// Handle file selection
fileInput.addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    handleImageUpload(file);
  }
});

// Handle the actual image upload
function handleImageUpload(file) {
  // Check if file is an image
  if (!file.type.startsWith("image/")) {
    alert("Please upload an image file");
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    // Save image to app state
    AppState.setCurrentImage(e.target.result);
    // Redirect to edit page
    window.location.href = "../image_edit/image_edit.html";
  };

  reader.onerror = function () {
    alert("Error reading file");
  };

  // Read the image file as a data URL
  reader.readAsDataURL(file);
}

// Handle click on upload button
uploadButton.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  fileInput.click();
});

// Initialize drag and drop
initializeDragAndDrop(container, handleImageUpload);

