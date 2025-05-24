import { appState } from "./state.js";
import { renderer } from "./renderer.js";
import { apiService } from "./api.js";
import { edgeControls } from "./edge-detection-controls.js";

/**
 * Manages UI controls and workflow transitions
 *
 * Responsibilities:
 * - Initializing control button event listeners
 * - Handling image transformations (rotate, mirror)
 * - Managing workflow step transitions
 * - Updating UI based on current workflow step
 */
class Controls {
  constructor() {
    this.imageElement = document.getElementById("uploaded-image");
    this.dimensionsContainer = document.getElementById("drawer-dimensions");
    this.widthInput = document.getElementById("drawer-width");
    this.heightInput = document.getElementById("drawer-height");
    this.initControls();
    this.initDimensionInput();
  }

  initControls() {
    /**
     * Sets up event listeners for control buttons
     */
    document.addEventListener("DOMContentLoaded", () => {
      // Rotation button
      document
        .querySelector(".control-button:nth-child(1)")
        .addEventListener("click", () => this.rotateImage());

      // Mirror button
      document
        .querySelector(".control-button:nth-child(2)")
        .addEventListener("click", () => this.mirrorImage());

      // Reupload button
      document
        .querySelector(".control-button:nth-child(3)")
        .addEventListener("click", () => {
          document.getElementById("image-upload").click();
        });

      // Continue/Submit button
      const continueButton = document.querySelector(".control-button.primary");
      if (continueButton) {
        continueButton.addEventListener("click", () => this.handleContinue());
      }
    });
  }

  initDimensionInput() {
    // Initialize with default values from appState
    if (this.widthInput && this.heightInput) {
      this.widthInput.value = appState.realWidthMm;
      this.heightInput.value = appState.realHeightMm;

      // Add event listeners to update state when inputs change
      this.widthInput.addEventListener("change", () => {
        const width = parseFloat(this.widthInput.value);
        if (width > 0) {
          appState.updateDimensions(width, appState.realHeightMm);
        }
      });

      this.heightInput.addEventListener("change", () => {
        const height = parseFloat(this.heightInput.value);
        if (height > 0) {
          appState.updateDimensions(appState.realWidthMm, height);
        }
      });
    }
  }

  handleContinue() {
    switch (appState.currentWorkflowStep) {
      case 1:
        this.switchToStep2();
        break;
      case 2:
        if (appState.coordinates.length === 4) {
          apiService.sendToAPI();
        } else {
          renderer.showMessage("Please place all 4 corner points", true);
        }
        break;
      case 3:
        this.switchToStep4();
        break;
      case 4:
        apiService.sendToAPI();
        break;
    }
  }

  rotateImage() {
    appState.currentRotation = (appState.currentRotation + 90) % 360;
    renderer.imageElement.style.transform = `${
      appState.isMirrored ? "scaleX(-1)" : ""
    } rotate(${appState.currentRotation}deg)`;
  }

  mirrorImage() {
    appState.isMirrored = !appState.isMirrored;
    renderer.imageElement.style.transform = `${
      appState.isMirrored ? "scaleX(-1)" : ""
    } rotate(${appState.currentRotation}deg)`;
  }

  switchToStep1() {
    /**
     * Reupload
     */
    // Reset workflow state
    appState.currentWorkflowStep = 1;
    appState.allowDotPlacement = false;
    appState.resetCoordinates();

    // Hide frame selector if it exists
    if (renderer.frameSelector) {
      renderer.frameSelector.hide();
    }

    // Show transformation controls
    const transformControls = document.querySelectorAll(".transform-control");
    transformControls.forEach((control) => control.classList.add("flex"));

    // Show reupload button
    const reuploadButton = document.querySelector(".reupload-button");
    if (reuploadButton) reuploadButton.classList.add("flex");

    // Update continue button text
    const continueButton = document.querySelector(".control-button.primary");
    if (continueButton)
      continueButton.querySelector("span").textContent = "Continue";

    // Clean up instructions
    const instructionElement = document.getElementById("placement-instruction");
    if (instructionElement) instructionElement.remove();

    // Update progress tracker
    if (window.progressTracker) {
      window.progressTracker.previousStep();
    }

    // Hide dimensions input
    if (this.dimensionsContainer) {
      this.dimensionsContainer.classList.remove("visible");
    }

    // Hide edge detection controls if they exist
    const edgeControls = document.getElementById("edge-detection-controls");
    if (edgeControls) {
      edgeControls.classList.remove("visible");
    }
  }

  switchToStep2() {
    /**
     * Update to step 2, show frame selector
     */

    // Update workflow state
    appState.currentWorkflowStep = 2;
    appState.allowDotPlacement = true;
    appState.resetCoordinates();

    // Show frame selector
    if (renderer.frameSelector) {
      renderer.frameSelector.show();
    } else {
      renderer.frameSelector = new FrameSelector(renderer.imageElement);
    }

    // Hide rotate and mirror buttons
    document.querySelector(".control-button:nth-child(1)").style.display =
      "none"; // Rotate button
    document.querySelector(".control-button:nth-child(2)").style.display =
      "none"; // Mirror button

    // Hide transformation controls
    const transformControls = document.querySelectorAll(".transform-control");
    transformControls.forEach((control) => control.classList.remove("flex"));

    // Hide reupload button
    const reuploadButton = document.querySelector(".reupload-button");
    if (reuploadButton) reuploadButton.classList.remove("flex");

    // Add back button if it doesn't exist
    if (!document.querySelector(".control-button.back")) {
      const backButton = document.createElement("button");
      backButton.className = "control-button back flex";
      backButton.innerHTML = "<span>Back</span>";
      backButton.addEventListener("click", () => this.switchToStep1());
      document
        .querySelector(".controls")
        .insertBefore(
          backButton,
          document.querySelector(".controls").firstChild,
        );
    }

    // Update submit button text
    const continueButton = document.querySelector(".control-button.primary");
    if (continueButton)
      continueButton.querySelector("span").textContent = "Submit";

    // Update instructions
    renderer.updateInstruction(
      "Drag the corner points to align with the drawer",
    );

    // Show dimensions input
    if (this.dimensionsContainer) {
      this.dimensionsContainer.classList.add("visible");
    }
  }

  switchToStep3() {
    /**
     * Edge detection controls
     */
    appState.currentWorkflowStep = 3;

    // Hide frame selector
    if (renderer.frameSelector) {
      renderer.frameSelector.hide();
    }

    // Hide back button
    const backButton = document.querySelector(".control-button.back");
    if (backButton) {
      backButton.remove();
    }

    // Hide dimensions input
    if (this.dimensionsContainer) {
      this.dimensionsContainer.classList.remove("visible");
    }

    // Show edge detection controls
    const edgeControls = document.getElementById("edge-detection-controls");
    if (edgeControls) {
      edgeControls.classList.add("visible");
    }

    // Update instructions
    renderer.updateInstruction("Adjust edge detection settings");

    // Update button text
    const continueButton = document.querySelector(".control-button.primary");
    if (continueButton) {
      continueButton.querySelector("span").textContent = "Export";
    }
  }

  switchToStep4() {
    /**
     * Update to step 4
     */
    appState.currentWorkflowStep = 4;

    // Show edge detection controls
    const edgeControls = document.getElementById("edge-detection-controls");
    if (edgeControls) {
      edgeControls.classList.add("visible");
    }

    // Update submit button text
    const continueButton = document.querySelector(".control-button.primary");
    if (continueButton) {
      continueButton.querySelector("span").textContent = "Submit";
    }
  }
}

// Create and export a single instance
export const controls = new Controls();
// Make it available globally for the API service
window.controls = controls;
