import { appState } from "./state.js";
import { renderer } from "./renderer.js";
import { sendToAPI } from "./api.js";
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
export class Controls {
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

  rotateImage() {
    if (!this.imageElement.src || appState.currentWorkflowStep !== 1) return;

    const computedStyle = window.getComputedStyle(this.imageElement);
    const maxWidth = computedStyle.maxWidth;
    const maxHeight = computedStyle.maxHeight;

    // Swap the maxWidth and maxHeight using inline styles
    this.imageElement.style.maxWidth = maxHeight;
    this.imageElement.style.maxHeight = maxWidth;

    appState.currentRotation = (appState.currentRotation + 90) % 360;
    this.applyTransformations();
  }

  mirrorImage() {
    if (!this.imageElement.src || appState.currentWorkflowStep !== 1) return;

    appState.isMirrored = !appState.isMirrored;
    this.applyTransformations();
  }

  applyTransformations() {
    /*
     * Updates image CSS to reflect transformations
     */
    this.imageElement.style.transform = `
      rotate(${appState.currentRotation}deg)
      scaleX(${appState.isMirrored ? -1 : 1})
    `;
  }

  handleContinue() {
    /**
     * Process Continue button click
     */
    if (appState.currentWorkflowStep === 1) {
      this.switchToStep2();
      if (window.progressTracker) window.progressTracker.nextStep();
    } else if (appState.currentWorkflowStep === 2) {
      sendToAPI();
      this.switchToStep3();
      if (window.progressTracker) window.progressTracker.nextStep();
    } else if (appState.currentWorkflowStep === 3) {
      this.switchToStep4();
      if (window.progressTracker) window.progressTracker.nextStep();
    }
  }

  switchToStep1() {
    /**
     * Reupload
     */
    // Reset workflow state
    appState.currentWorkflowStep = 1;
    appState.allowDotPlacement = false;
    appState.resetCoordinates();
    renderer.removeAllMarkers();

    // Update UI controls visibility
    document.querySelector(".controls .control-button:first-child").remove();
    const controlButtons = document.querySelectorAll(".control-button");
    for (let i = 0; i < 3; i++) {
      if (controlButtons[i]) controlButtons[i].classList.add("flex");
    }

    // Update continue button text
    const continueButton = document.querySelector(".control-button.primary");
    if (continueButton)
      continueButton.querySelector("span").textContent = "Continue";

    // Clean up instructions
    const instructionElement = document.getElementById("placement-instruction");
    if (instructionElement) instructionElement.remove();

    // Update progress tracker
    if (window.progressTracker) window.progressTracker.previousStep();

    // Hide dimensions input
    if (this.dimensionsContainer) {
      this.dimensionsContainer.classList.remove("visible");
    }
  }

  switchToStep2() {
    /**
     * Update to step 2, allow dot placemnt
     */

    // Update workflow state
    appState.currentWorkflowStep = 2;
    appState.allowDotPlacement = true;
    appState.resetCoordinates();
    renderer.removeAllMarkers();

    // Hide transformation buttons
    const controlButtons = document.querySelectorAll(".control-button");
    for (let i = 0; i < 3; i++) {
      if (controlButtons[i]) controlButtons[i].classList.remove("flex");
    }

    // Add back button
    const backButton = document.createElement("button");
    backButton.className = "control-button flex";
    backButton.innerHTML = "<span>Back</span>";
    backButton.addEventListener("click", () => this.switchToStep1());
    document
      .querySelector(".controls")
      .insertBefore(backButton, document.querySelector(".controls").firstChild);

    // Update submit button text
    const continueButton = document.querySelector(".control-button.primary");
    if (continueButton)
      continueButton.querySelector("span").textContent = "Submit";

    // Update instructions
    renderer.updateInstruction("Click to place up to 4 points on the image");

    // Show dimensions input
    if (this.dimensionsContainer) {
      this.dimensionsContainer.classList.add("visible");
    }
  }

  switchToStep3() {
    /**
     * Update to step 3
     */
    appState.currentWorkflowStep = 3;
    appState.allowDotPlacement = false;
    appState.resetCoordinates();
    renderer.removeAllMarkers();

    // Remove back button if it exists
    const backButton = document.querySelector(
      ".controls .control-button:first-child",
    );
    if (backButton && backButton.textContent.includes("Back")) {
      backButton.remove();
    }

    // Update instructions
    renderer.updateInstruction(
      "Review the detected edges",
    );

    // Hide dimensions input if visible
    if (
      this.dimensionsContainer &&
      this.dimensionsContainer.classList.contains("visible")
    ) {
      this.dimensionsContainer.classList.remove("visible");
    }

    // Update submit button text
    const continueButton = document.querySelector(".control-button.primary");
    if (continueButton) {
      continueButton.querySelector("span").textContent = "Adjust Edges";
    }
  }

  switchToStep4() {
    /**
     * Update to step 4, enable edge detection controls
     */
    appState.currentWorkflowStep = 4;

    // Update instructions
    renderer.updateInstruction(
      "Adjust edge detection parameters to improve contour finding",
    );

    // Show edge detection controls
    edgeControls.show();

    // Update submit button text
    const continueButton = document.querySelector(".control-button.primary");
    if (continueButton) {
      continueButton.querySelector("span").textContent = "Export";
    }
  }
}

// Create and export a single instance
export const controls = new Controls();
