/**
 * Application entry poin t
 * Loads and initializes all modules
 */
import { renderer } from "./renderer.js";
import { controls } from "./controls.js";
import "./progress-tracker.js";
import { AuthController } from './controllers/AuthController.js';

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  console.log("Application initialized");
});

// Initialize authentication
const authController = new AuthController();

// Export for use in other modules if needed
export { authController };
