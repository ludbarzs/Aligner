import { appState } from "./state.js";
import { sendToAPI } from "./api.js";
import { FrameSelector } from "./frame-selector.js";

/**
 * Handles:
 * - Image uploading and display
 * - Processing image click for coordinate retrival
 * - Manages visual cordinate markers on screen
 * - Display messages and instructions for user
 * - Calculates image cordinates based on click
 */
export class Renderer {
  constructor() {
    this.imageElement = document.getElementById("uploaded-image");
    this.uploadInterface = document.getElementById("upload-interface");
    this.controlButtons = document.querySelectorAll(".control-button");
    this.authButtons = document.getElementById("auth-buttons");
    this.frameSelector = null;
    this.initEventListeners();
  }

  initEventListeners() {
    // Image upload handler
    document
      .getElementById("image-upload")
      .addEventListener("change", (e) => this.handleImageUpload(e));
  }

  /**
   * Processes file input changes
   * - Display uploaded image
   * - Show control buttons (CSS class: control-button)
   * - Update progress tracker
   */
  handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      this.imageElement.src = event.target.result;
      this.imageElement.style.display = "block";
      this.uploadInterface.style.display = "none";
      this.authButtons.style.display = "none";

      appState.setImageData(event.target.result);
      appState.resetCoordinates();
      this.showControlButtons();

      // Reset transformations on new upload
      appState.currentRotation = 0;
      appState.isMirrored = false;
      this.imageElement.style.transform = "";

      // Initialize frame selector after image is loaded but keep it hidden
      this.imageElement.onload = () => {
        if (this.frameSelector) {
          this.frameSelector.hide();
        }
        this.frameSelector = new FrameSelector(this.imageElement);
        this.frameSelector.hide(); // Ensure it's hidden initially
      };

      if (window.progressTracker) {
        window.progressTracker.nextStep();
      }
    };
    reader.readAsDataURL(file);
  }

  /**
   * Shows control buttons
   */
  showControlButtons() {
    this.controlButtons.forEach((button) => {
      button.style.display = "flex";
    });
  }

  /**
   * Shows a message to the user
   */
  showMessage(text, isError = false) {
    const messageElement = document.createElement("div");
    messageElement.className = `message ${isError ? "error" : ""}`;
    messageElement.textContent = text;
    document.body.appendChild(messageElement);

    setTimeout(() => {
      messageElement.remove();
    }, 3000);
  }

  /**
   * Updates the instruction text for the current step
   */
  updateInstruction(text) {
    let instructionElement = document.getElementById("placement-instruction");
    if (!instructionElement) {
      instructionElement = document.createElement("div");
      instructionElement.id = "placement-instruction";
      instructionElement.className = "placement-instruction";
      document.body.appendChild(instructionElement);
    }
    instructionElement.textContent = text;
  }
}

export const renderer = new Renderer();
