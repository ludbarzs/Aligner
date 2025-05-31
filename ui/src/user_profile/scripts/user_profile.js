import { authController } from "../../scripts/controllers/AuthController.js";
import { ImageController } from "../../scripts/controllers/image_controller.js";

document.addEventListener("DOMContentLoaded", () => {
  // Logout button handler
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", async () => {
    await authController.handleLogout();
    window.location.href = "../image_upload/image_upload.html";
  });

  // Initialize projects grid
  initProjectsGrid();
});

async function initProjectsGrid() {
  const projectsGrid = document.getElementById("projects-grid");

  // Function to add a new project
  function addProject(imageData) {
    const projectItem = document.createElement("div");
    projectItem.className = "project-item";

    const date = new Date(imageData.createdAt || new Date()).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );

    projectItem.innerHTML = `
            <img src="${imageData.base64_data}" />
            <div class="project-overlay">
              <h3 class="project-title">Project ${imageData.image_id}</h3>
              <div class="project-date">${date}</div>
            </div>
          `;

    // Add click event listener
    projectItem.addEventListener("click", () => {
      // Handle project click - you can add navigation or preview functionality here
      console.log("Project clicked:", imageData.image_id);
    });

    projectsGrid.appendChild(projectItem);
  }

  try {
    // Clear existing content
    projectsGrid.innerHTML = "";

    // Show loading state
    projectsGrid.innerHTML =
      '<div class="loading">Loading your projects...</div>';

    // Fetch user's images from the database
    const userImages = await ImageController.getCurrentUserImages();

    // Log the complete API response
    console.log("Full API Response - User Images:", userImages);
    if (userImages && userImages.length > 0) {
      console.log("Number of images:", userImages.length);
      userImages.forEach((image, index) => {
        console.log(`Image ${index + 1} details:`, image);
      });
    }

    // Clear loading state
    projectsGrid.innerHTML = "";

    if (userImages && userImages.length > 0) {
      // Add all user projects
      userImages.forEach((image) => {
        addProject(image);
      });
    } else {
      projectsGrid.innerHTML =
        '<div class="no-projects">No projects found. Start by uploading an image!</div>';
    }
  } catch (error) {
    console.error("Error loading projects:", error);
    projectsGrid.innerHTML =
      '<div class="error">Error loading projects. Please try again later.</div>';
  }
}
