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

      if (window.progressTracker) {
        window.progressTracker.nextStep();
      }
    };
    reader.readAsDataURL(file);
  }

  showFrameSelector() {
    if (this.frameSelector) {
      this.frameSelector.show();
    } else {
      this.frameSelector = new FrameSelector(this.imageElement);
    }
  }

  hideFrameSelector() {
    if (this.frameSelector) {
      this.frameSelector.hide();
    }
  }

  /**
   * Display control buttons (Continue...)
   */
  showControlButtons() {
    this.controlButtons.forEach((button) => button.classList.add("flex"));
  }

  /**
   * Displays a notification message to the user
   * @param {string} message - Message to display
   * @param {string} isError - Error on info
   */
  showMessage(message, isError = false) {
    // Remove any existing messages first
    const existingMsg = document.getElementById("notification-message");
    if (existingMsg) existingMsg.remove();

    const message_type = isError ? "error" : "info";

    // Create message element
    const msgElement = document.createElement("div");
    msgElement.id = "notification-message";
    msgElement.className = `message-notification ${message_type}`;
    msgElement.textContent = message;

    // Add to DOM
    document.body.appendChild(msgElement);

    // Force reflow to ensure transition works
    void msgElement.offsetWidth;

    // Make visible
    setTimeout(() => {
      msgElement.classList.add("visible");
    }, 10);

    // Set timeout to remove
    setTimeout(() => {
      msgElement.classList.remove("visible");

      // Remove from DOM after fade out
      setTimeout(() => msgElement.remove(), 300);
    }, 10000);
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
