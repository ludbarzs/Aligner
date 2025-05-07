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
   * - Accounts for transformations like rotation and mirroring
   */
  calculateImageCoordinates(event) {
    const rect = this.imageElement.getBoundingClientRect();
    const naturalWidth = this.imageElement.naturalWidth;
    const naturalHeight = this.imageElement.naturalHeight;
    const displayedWidth = rect.width;
    const displayedHeight = rect.height;

    // Calculate scale factors for the image
    const scaleX = naturalWidth / displayedWidth;
    const scaleY = naturalHeight / displayedHeight;

    // Calculate relative position within the displayed image
    let relX = event.clientX - rect.left;
    let relY = event.clientY - rect.top;

    // Adjust for rotation and mirroring transformations
    let adjustedX, adjustedY;

    // Handle rotation
    switch (appState.currentRotation) {
      case 0:
        adjustedX = relX;
        adjustedY = relY;
        break;
      case 90:
        // For 90° rotation, X becomes Y and Y becomes width-X
        adjustedX = relY;
        adjustedY = displayedWidth - relX;
        break;
      case 180:
        // For 180° rotation, X becomes width-X and Y becomes height-Y
        adjustedX = displayedWidth - relX;
        adjustedY = displayedHeight - relY;
        break;
      case 270:
        // For 270° rotation, X becomes height-Y and Y becomes X
        adjustedX = displayedHeight - relY;
        adjustedY = relX;
        break;
      default:
        adjustedX = relX;
        adjustedY = relY;
    }

    // Handle mirroring (horizontal flip)
    if (appState.isMirrored) {
      if (appState.currentRotation === 0 || appState.currentRotation === 180) {
        // For 0° or 180° rotation, mirror affects X
        adjustedX = displayedWidth - adjustedX;
      } else {
        // For 90° or 270° rotation, mirror affects Y
        adjustedY = displayedHeight - adjustedY;
      }
    }

    // Apply scaling to get coordinates in the original image dimensions
    const finalX = adjustedX * scaleX;
    const finalY = adjustedY * scaleY;

    return {
      x: finalX,
      y: finalY,
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
