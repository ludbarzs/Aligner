/**
 * Handles the visual aspects of the progress bar
 */
export class ProgressBar {
  constructor(selector = '.progress-bar') {
    this.element = document.querySelector(selector);
    if (!this.element) {
      console.error('Progress bar element not found');
    }
  }

  /**
   * Updates the visual progress of the bar
   * @param {number} currentStep - Current step (0-based)
   * @param {number} totalSteps - Total number of steps
   */
  updateProgress(currentStep, totalSteps) {
    if (this.element) {
      const progressPercentage = (currentStep / totalSteps) * 100;
      this.element.style.width = `${progressPercentage}%`;
    }
  }
}

// Create and export a singleton instance
export const progressBar = new ProgressBar(); 