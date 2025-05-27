/**
 * Application entry poin t
 * Loads and initializes all modules
 */
import { renderer } from "./renderer.js";
import { controls } from "./controls.js";
import "./progress-tracker.js";

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  console.log("Application initialized");
});
