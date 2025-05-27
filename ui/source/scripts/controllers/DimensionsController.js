import { appState } from '../state.js';
import { UI_ELEMENTS } from '../constants.js';

/**
 * Handles dimension input controls and validation
 */
export class DimensionsController {
  constructor() {
    this.dimensionsContainer = document.getElementById(UI_ELEMENTS.DRAWER_DIMENSIONS);
    this.widthInput = document.getElementById(UI_ELEMENTS.DRAWER_WIDTH);
    this.heightInput = document.getElementById(UI_ELEMENTS.DRAWER_HEIGHT);
    this.initDimensionInputs();
  }

  initDimensionInputs() {
    if (!this.widthInput || !this.heightInput) return;

    // Initialize with default values
    this.widthInput.value = appState.realWidthMm;
    this.heightInput.value = appState.realHeightMm;

    // Add event listeners
    this.widthInput.addEventListener('change', () => this.handleWidthChange());
    this.heightInput.addEventListener('change', () => this.handleHeightChange());
  }

  handleWidthChange() {
    const width = parseFloat(this.widthInput.value);
    if (width > 0) {
      appState.updateDimensions(width, appState.realHeightMm);
    }
  }

  handleHeightChange() {
    const height = parseFloat(this.heightInput.value);
    if (height > 0) {
      appState.updateDimensions(appState.realWidthMm, height);
    }
  }

  show() {
    this.dimensionsContainer?.classList.add('visible');
  }

  hide() {
    this.dimensionsContainer?.classList.remove('visible');
  }
} 