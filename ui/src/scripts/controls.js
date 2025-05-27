import { appState } from './state.js';
import { renderer } from './renderer.js';
import { sendToAPI } from './api.js';
import { ImageTransformController } from './controllers/ImageTransformController.js';
import { DimensionsController } from './controllers/DimensionsController.js';
import { WORKFLOW_STEPS, BUTTON_TEXT, UI_ELEMENTS } from './constants.js';

/**
 * Manages UI controls and workflow transitions
 *
 * Responsibilities:
 * - Initializing control button event listeners
 * - Managing workflow step transitions
 * - Coordinating between different controllers
 */
export class Controls {
  constructor() {
    this.imageTransform = new ImageTransformController();
    this.dimensions = new DimensionsController();
    this.initControls();
  }

  initControls() {
    document.addEventListener('DOMContentLoaded', () => {
      // Rotation button
      document
        .querySelector('.control-button:nth-child(1)')
        .addEventListener('click', () => this.imageTransform.rotateImage());

      // Mirror button
      document
        .querySelector('.control-button:nth-child(2)')
        .addEventListener('click', () => this.imageTransform.mirrorImage());

      // Reupload button
      document
        .querySelector('.control-button:nth-child(3)')
        .addEventListener('click', () => {
          document.getElementById(UI_ELEMENTS.IMAGE_UPLOAD).click();
        });

      // Continue/Submit button
      const continueButton = document.querySelector('.control-button.primary');
      if (continueButton) {
        continueButton.addEventListener('click', () => this.handleContinue());
      }
    });
  }

  handleContinue() {
    switch (appState.currentWorkflowStep) {
      case WORKFLOW_STEPS.UPLOAD:
        this.switchToStep2();
        break;
      case WORKFLOW_STEPS.FRAME_SELECTION:
        sendToAPI();
        this.switchToStep3();
        break;
      case WORKFLOW_STEPS.PROCESSING:
        this.switchToStep4();
        break;
    }
    if (window.progressTracker) window.progressTracker.nextStep();
  }

  switchToStep1() {
    // Reset workflow state
    appState.currentWorkflowStep = WORKFLOW_STEPS.UPLOAD;
    appState.allowDotPlacement = false;
    appState.resetCoordinates();
    
    // Hide frame selector and dimensions
    renderer.hideFrameSelector();
    this.dimensions.hide();

    // Update UI controls
    this.updateControlButtons(WORKFLOW_STEPS.UPLOAD);
    
    // Clean up instructions
    const instructionElement = document.getElementById(UI_ELEMENTS.PLACEMENT_INSTRUCTION);
    if (instructionElement) instructionElement.remove();

    if (window.progressTracker) window.progressTracker.previousStep();
  }

  switchToStep2() {
    appState.currentWorkflowStep = WORKFLOW_STEPS.FRAME_SELECTION;
    appState.allowDotPlacement = false;
    appState.resetCoordinates();

    renderer.showFrameSelector();
    this.updateControlButtons(WORKFLOW_STEPS.FRAME_SELECTION);
  }

  switchToStep3() {
    appState.currentWorkflowStep = WORKFLOW_STEPS.PROCESSING;
    this.updateControlButtons(WORKFLOW_STEPS.PROCESSING);
  }

  switchToStep4() {
    appState.currentWorkflowStep = WORKFLOW_STEPS.COMPLETE;
    this.updateControlButtons(WORKFLOW_STEPS.COMPLETE);
  }

  updateControlButtons(step) {
    const controls = document.querySelector('.controls');
    const controlButtons = document.querySelectorAll('.control-button');
    const continueButton = document.querySelector('.control-button.primary');

    // Hide all buttons first
    controlButtons.forEach(button => {
      button.classList.remove('flex');
      if (button.querySelector('span')?.textContent === BUTTON_TEXT.REUPLOAD) {
        button.style.display = step === WORKFLOW_STEPS.UPLOAD ? '' : 'none';
      }
    });

    // Add back button for steps after upload
    if (step > WORKFLOW_STEPS.UPLOAD) {
      const backButton = document.createElement('button');
      backButton.className = 'control-button flex';
      backButton.innerHTML = `<span>${BUTTON_TEXT.BACK}</span>`;
      backButton.addEventListener('click', () => this.switchToStep1());
      controls.insertBefore(backButton, controls.firstChild);
    }

    // Update continue button
    if (continueButton) {
      continueButton.querySelector('span').textContent = 
        step === WORKFLOW_STEPS.FRAME_SELECTION ? BUTTON_TEXT.SUBMIT : BUTTON_TEXT.CONTINUE;
      continueButton.classList.add('flex');
    }
  }
}

// Export a singleton instance
export const controls = new Controls();
