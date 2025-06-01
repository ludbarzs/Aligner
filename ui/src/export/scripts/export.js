import { AppState } from "../../scripts/app_state.js";
import { authController } from "../../scripts/controllers/AuthController.js";

// Function to print the current state of AppState
function printState() {
  console.log("=== Current AppState ===");
  console.log(
    "Current Image:",
    AppState.getCurrentImage() ? "Present" : "None",
  );
  console.log("Transformations:", AppState.getTransformations());
  console.log("Corner Coordinates:", AppState.getCornerCoordinates());
  console.log("Drawer Dimensions:", AppState.getDrawerDimensions());
  console.log("Edge Detection Settings:", AppState.getEdgeDetectionSettings());
  console.log(
    "Contoured Image:",
    AppState.getContouredImage() ? "Present" : "None",
  );
  console.log("DXF Data:", AppState.getDxfData() ? "Present" : "None");
  console.log("=====================");
}

// Initialize AuthController
document.addEventListener("DOMContentLoaded", async () => {
  // Initialize auth controller
  await authController.init();
});

// Function to download the DXF file
function downloadDxf() {
  const dxfData = AppState.getDxfData();

  if (!dxfData) {
    alert("No DXF data available. Please process an image first.");
    return;
  }

  // Create a Blob from the base64 DXF data
  const binaryData = atob(dxfData);
  const blob = new Blob([binaryData], { type: "application/dxf" });

  // Create a download link
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "exported.dxf";

  // Trigger the download
  document.body.appendChild(a);
  a.click();

  // Cleanup
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// Add click event listener to the export button
document.getElementById("export-button").addEventListener("click", downloadDxf);

// Print state when the page loads
document.addEventListener("DOMContentLoaded", printState);

// Check if we have processed data
if (!AppState.getDxfData()) {
  alert("No processed data found. Redirecting to upload page...");
  window.location.href = "../image_upload/image_upload.html";
}
