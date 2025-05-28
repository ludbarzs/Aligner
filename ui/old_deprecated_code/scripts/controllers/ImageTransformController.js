import { appState } from "../state.js";
import { UI_ELEMENTS, DEFAULT_VALUES } from "../constants.js";

/**
 * Handles image transformations like rotation and mirroring
 */
export class ImageTransformController {
  constructor() {
    this.imageElement = document.getElementById(UI_ELEMENTS.UPLOADED_IMAGE);
  }

  rotateImage() {
    if (!this.imageElement.src || appState.currentWorkflowStep !== 1) return;

    appState.currentRotation =
      (appState.currentRotation + DEFAULT_VALUES.ROTATION_STEP) %
      DEFAULT_VALUES.MAX_ROTATION;
    this.applyTransformations();
  }

  mirrorImage() {
    if (!this.imageElement.src || appState.currentWorkflowStep !== 1) return;

    appState.isMirrored = !appState.isMirrored;
    this.applyTransformations();
  }

  applyTransformations() {
    // For 90° and 270° rotations, we need to scale down to fit
    const isRotated = appState.currentRotation % 180 !== 0;
    const scale = isRotated ? 0.7 : 1; // Scale down more when rotated to ensure fitting

    this.imageElement.style.transform = `
      rotate(${appState.currentRotation}deg)
      scaleX(${appState.isMirrored ? -1 : 1})
      scale(${scale})
    `;
  }
}

