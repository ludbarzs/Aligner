import { appState } from "./state.js";
import { sendToAPI } from "./api.js";

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
    this.initEventListeners();
  }

  initEventListeners() {
    // Image upload handler
    document
      .getElementById("image-upload")
      .addEventListener("change", (e) => this.handleImageUpload(e));

    // Image click handler
    this.imageElement.addEventListener("click", (e) =>
      this.handleImageClick(e),
    );
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

      appState.setImageData(event.target.result);
      appState.resetCoordinates();
      this.showControlButtons();
      this.removeAllMarkers();

      if (window.progressTracker) {
        window.progressTracker.nextStep();
      }
    };
    reader.readAsDataURL(file);
  }

  /**
   * Process clicks on image for marker placement
   */
  handleImageClick(e) {
    if (!appState.allowDotPlacement || !this.imageElement.src) return;

    if (appState.coordinates.length >= 4) {
      this.showMessage(
        "You have already selected 4 points. Click 'Back' to restart.",
        true,
      );
      return;
    }

    const coord = this.calculateImageCoordinates(e);
    if (appState.addCoordinate(coord)) {
      this.createMarker(e.clientX, e.clientY, appState.coordinates.length);

      if (appState.coordinates.length === 4) {
        this.updateInstruction(
          'All 4 points placed. Click "Submit" to continue.',
        );
      }
    }
  }

  /**
   * Converts screen coordinates to image coordinates
   * - Gets image position/size on screen
   * - Calculates scale from displayed to natural size
   * - Adjusts mouse offset by scale to get true image (x, y)
   */
  calculateImageCoordinates(event) {
    const rect = this.imageElement.getBoundingClientRect();
    // Ratio between actual image size and displayed size in pixels
    const scaleX = this.imageElement.naturalWidth / rect.width;
    const scaleY = this.imageElement.naturalHeight / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX, // Mouse X position on screen - image edge position * scale
      y: (event.clientY - rect.top) * scaleY, // Mouse Y position on screen - image edge position * scale
    };
  }

  /**
   * Create dot on image
   */
  createMarker(clientX, clientY, number) {
    this.removeMarker(number);

    const marker = document.createElement("div");
    marker.className = `marker marker-${number}`;
    marker.style.position = "absolute";
    marker.style.left = `${clientX}px`;
    marker.style.top = `${clientY}px`;
    marker.style.width = "10px";
    marker.style.height = "10px";
    marker.style.backgroundColor = "#7CFC00";
    marker.style.borderRadius = "50%";
    marker.style.zIndex = "1000";
    marker.style.pointerEvents = "none";
    marker.style.transform = "translate(-50%, -50%)";

    document.body.appendChild(marker);
  }

  removeMarker(number) {
    document.querySelectorAll(`.marker-${number}`).forEach((el) => el.remove());
  }

  removeAllMarkers() {
    document.querySelectorAll(".marker").forEach((el) => el.remove());
  }

  /**
   * Display control buttons (Continue...)
   */
  showControlButtons() {
    this.controlButtons.forEach((button) => button.classList.add("flex"));
  }

  /**
   * Display feedback to the user
   */
  showMessage(message, isError = false) {
    const existingMsg = document.getElementById("api-result-message");
    if (existingMsg) existingMsg.remove();

    const msgElement = document.createElement("div");
    msgElement.id = "api-result-message";
    msgElement.className = `result-message ${isError ? "error" : "success"}`;
    msgElement.textContent = message;
    document.body.appendChild(msgElement);

    setTimeout(() => msgElement.remove(), 5000);
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
