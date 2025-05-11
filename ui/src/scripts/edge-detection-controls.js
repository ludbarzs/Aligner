// edge-detection-controls.js
import { appState } from "./state.js";
import { apiService } from "./api.js";

/**
 * Manages the edge detection control sliders
 */
export class EdgeDetectionControls {
  constructor() {
    this.controlsContainer = document.getElementById("edge-detection-controls");
    this.blurSlider = document.getElementById("blur-slider");
    this.edgeThresholdSlider = document.getElementById("edge-threshold-slider");
    this.morphSlider = document.getElementById("morph-slider");
    this.applyButton = document.getElementById("apply-edge-settings");

    // Default values
    this.blurSize = 5;
    this.edgeThreshold = 80;
    this.morphSize = 5;

    this.initControls();
  }

  /**
   * Initialize sliders and event listeners
   */
  initControls() {
    if (!this.controlsContainer) return;

    // Setup slider value displays
    this.setupSliderValueDisplay(this.blurSlider);
    this.setupSliderValueDisplay(this.edgeThresholdSlider);
    this.setupSliderValueDisplay(this.morphSlider);

    // Apply button listener
    if (this.applyButton) {
      this.applyButton.addEventListener("click", () => this.applySettings());
    }

    // Store slider values in state
    this.blurSlider.addEventListener("change", () => {
      this.blurSize = parseInt(this.blurSlider.value);
      appState.updateEdgeDetectionSettings({
        blurKernelSize: this.getBlurKernelSize(),
        edgeThreshold: this.edgeThreshold,
        morphKernelSize: this.getMorphKernelSize(),
      });
    });

    this.edgeThresholdSlider.addEventListener("change", () => {
      this.edgeThreshold = parseInt(this.edgeThresholdSlider.value);
      appState.updateEdgeDetectionSettings({
        blurKernelSize: this.getBlurKernelSize(),
        edgeThreshold: this.edgeThreshold,
        morphKernelSize: this.getMorphKernelSize(),
      });
    });

    this.morphSlider.addEventListener("change", () => {
      this.morphSize = parseInt(this.morphSlider.value);
      appState.updateEdgeDetectionSettings({
        blurKernelSize: this.getBlurKernelSize(),
        edgeThreshold: this.edgeThreshold,
        morphKernelSize: this.getMorphKernelSize(),
      });
    });
  }

  /**
   * Setup slider value display that updates when slider changes
   */
  setupSliderValueDisplay(slider) {
    if (!slider) return;

    const valueDisplay = slider.nextElementSibling;
    if (valueDisplay && valueDisplay.classList.contains("slider-value")) {
      // Update initially
      valueDisplay.textContent = slider.value;

      // Update on change
      slider.addEventListener("input", () => {
        valueDisplay.textContent = slider.value;
      });
    }
  }

  /**
   * Get the blur kernel size as a tuple [width, height]
   * Always use odd numbers for kernel size
   */
  getBlurKernelSize() {
    // Ensure odd numbers for kernel size
    const size = this.blurSize % 2 === 0 ? this.blurSize + 1 : this.blurSize;
    return [size, size];
  }

  /**
   * Get the morphological kernel size as a tuple [width, height]
   * Always use odd numbers for kernel size
   */
  getMorphKernelSize() {
    // Ensure odd numbers for kernel size
    const size = this.morphSize % 2 === 0 ? this.morphSize + 1 : this.morphSize;
    return [size, size];
  }

  /**
   * Apply current settings and send to API
   */
  applySettings() {
    apiService.sendToAPI();
  }

  /**
   * Show controls for step 3
   */
  show() {
    if (this.controlsContainer) {
      this.controlsContainer.classList.add("visible");
    }
  }

  /**
   * Hide controls
   */
  hide() {
    if (this.controlsContainer) {
      this.controlsContainer.classList.remove("visible");
    }
  }
}

// Create and export a single instance
export const edgeControls = new EdgeDetectionControls();
