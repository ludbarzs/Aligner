import { appState } from "./state.js";
import { renderer } from "./renderer.js";
import { sendToAPI } from "./api.js";

export class Controls {
  constructor() {
    this.imageElement = document.getElementById("uploaded-image");
    this.initControls();
  }

  initControls() {
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

  rotateImage() {
    if (!this.imageElement.src || appState.currentWorkflowStep !== 1) return;

    appState.currentRotation = (appState.currentRotation + 90) % 360;
    this.applyTransformations();
  }

  mirrorImage() {
    if (!this.imageElement.src || appState.currentWorkflowStep !== 1) return;

    appState.isMirrored = !appState.isMirrored;
    this.applyTransformations();
  }

  applyTransformations() {
    this.imageElement.style.transform = `
      rotate(${appState.currentRotation}deg)
      scaleX(${appState.isMirrored ? -1 : 1})
    `;
  }

  handleContinue() {
    if (appState.currentWorkflowStep === 1) {
      this.switchToStep2();
      if (window.progressTracker) window.progressTracker.nextStep();
    } else {
      sendToAPI();
      if (window.progressTracker) window.progressTracker.nextStep();
    }
  }

  switchToStep2() {
    appState.currentWorkflowStep = 2;
    appState.allowDotPlacement = true;
    appState.resetCoordinates();
    renderer.removeAllMarkers();

    // UI Changes
    const controlButtons = document.querySelectorAll(".control-button");
    for (let i = 0; i < 3; i++) {
      if (controlButtons[i]) controlButtons[i].classList.remove("flex");
    }

    const backButton = document.createElement("button");
    backButton.className = "control-button flex";
    backButton.innerHTML = "<span>Back</span>";
    backButton.addEventListener("click", () => this.switchToStep1());

    document
      .querySelector(".controls")
      .insertBefore(backButton, document.querySelector(".controls").firstChild);

    const continueButton = document.querySelector(".control-button.primary");
    if (continueButton)
      continueButton.querySelector("span").textContent = "Submit";

    renderer.updateInstruction("Click to place up to 4 points on the image");
  }

  switchToStep1() {
    appState.currentWorkflowStep = 1;
    appState.allowDotPlacement = false;
    appState.resetCoordinates();
    renderer.removeAllMarkers();

    // UI Changes
    document.querySelector(".controls .control-button:first-child").remove();

    const controlButtons = document.querySelectorAll(".control-button");
    for (let i = 0; i < 3; i++) {
      if (controlButtons[i]) controlButtons[i].classList.add("flex");
    }

    const continueButton = document.querySelector(".control-button.primary");
    if (continueButton)
      continueButton.querySelector("span").textContent = "Continue";

    const instructionElement = document.getElementById("placement-instruction");
    if (instructionElement) instructionElement.remove();

    if (window.progressTracker) window.progressTracker.previousStep();
  }
}

export const controls = new Controls();
