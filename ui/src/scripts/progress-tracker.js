// progress-tracker.js - Handles the progress bar functionality

/**
 * ProgressTracker - Manages the workflow progress visualization
 */
class ProgressTracker {
  constructor(progressBarSelector = ".progress-bar") {
    // The progress bar element
    this.progressBar = document.querySelector(progressBarSelector);

    // Configuration - easily update total steps here
    this.totalSteps = 6; // Total number of steps in the workflow

    // Current state
    this.currentStep = 0;

    // Initialize
    this.updateProgressBar();
  }

  /**
   * Advances the progress by one step
   */
  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.updateProgressBar();
    }
  }

  /**
   * Moves back one step
   */
  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.updateProgressBar();
    }
  }

  /**
   * Sets the progress to a specific step
   * @param {number} step - The step to set (1-based)
   */
  setStep(step) {
    if (step >= 0 && step <= this.totalSteps) {
      this.currentStep = step;
      this.updateProgressBar();
    }
  }

  /**
   * Updates the progress bar's width based on current progress
   */
  updateProgressBar() {
    const progressPercentage = (this.currentStep / this.totalSteps) * 100;
    this.progressBar.style.width = `${progressPercentage}%`;
  }

  /**
   * Resets the progress bar to the beginning
   */
  reset() {
    this.currentStep = 0;
    this.updateProgressBar();
  }
}

// Create a global instance of the progress tracker when the document loads
let progressTracker;

document.addEventListener("DOMContentLoaded", () => {
  progressTracker = new ProgressTracker();
});

// Export functions for other modules to use
globalThis.progressTracker = {
  nextStep: () => progressTracker.nextStep(),
  previousStep: () => progressTracker.previousStep(),
  setStep: (step) => progressTracker.setStep(step),
  reset: () => progressTracker.reset(),
};
