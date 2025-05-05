let coordinates = [];
const imageElement = document.getElementById("uploaded-image");
const uploadInterface = document.getElementById("upload-interface");

// Initialize global variable for dot placement permission
globalThis.allowDotPlacement = false;

// Handle image upload
document
  .getElementById("image-upload")
  .addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = function (event) {
        imageElement.src = event.target.result;
        imageElement.style.display = "block";
        uploadInterface.style.display = "none";

        // Show all control buttons
        document.querySelectorAll(".control-button").forEach((button) => {
          button.classList.add("flex");
        });

        coordinates = []; // Reset coordinates when new image is loaded
        removeAllMarkers(); // Remove any existing markers
        updateCoordinateList();

        // If we're in the controls.js context, reset rotation and mirror values
        if (typeof currentRotation !== "undefined") {
          currentRotation = 0;
        }
        if (typeof isMirrored !== "undefined") {
          isMirrored = false;
        }
        if (typeof originalImageData !== "undefined") {
          originalImageData = imageElement.src;
        }
        if (typeof currentWorkflowStep !== "undefined") {
          // Make sure we're in step 1 after a new upload
          if (currentWorkflowStep !== 1) {
            switchToStep1();
          }
        }

        // Reset dot placement permission
        globalThis.allowDotPlacement = false;
      };

      reader.readAsDataURL(file);
      if (globalThis.progressTracker) {
        globalThis.progressTracker.nextStep();
      }
    }
  });

// Handle clicks on the image
imageElement.addEventListener("click", function (e) {
  // Only allow placing dots if we're in step 2
  if (!globalThis.allowDotPlacement) {
    return;
  }

  if (coordinates.length >= 4) {
    alert("You have already selected 4 points. Click 'Back' to restart.");
    return;
  }

  // Get click position relative to the image
  const rect = imageElement.getBoundingClientRect();
  const scaleX = imageElement.naturalWidth / rect.width;
  const scaleY = imageElement.naturalHeight / rect.height;

  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;

  // Store the coordinate
  coordinates.push({ x, y });

  // Update the display
  updateCoordinateList();

  // Visual feedback (create a marker)
  createMarker(e.clientX, e.clientY, coordinates.length);

  // Update the instruction if we have all 4 points
  if (coordinates.length === 4) {
    const instructionElement = document.getElementById("placement-instruction");
    if (instructionElement) {
      instructionElement.textContent =
        'All 4 points placed. Click "Submit" to continue.';
    }
  }
});

// Create a visual marker on the image
function createMarker(clientX, clientY, number) {
  // Remove any existing markers with this number
  document.querySelectorAll(`.marker-${number}`).forEach((el) => el.remove());

  const marker = document.createElement("div");
  marker.className = `marker-${number}`;
  marker.style.position = "fixed";
  marker.style.left = `${clientX - 10}px`;
  marker.style.top = `${clientY - 10}px`;
  marker.style.width = "20px";
  marker.style.height = "20px";
  marker.style.backgroundColor = "red";
  marker.style.borderRadius = "50%";
  marker.style.color = "white";
  marker.style.textAlign = "center";
  marker.style.lineHeight = "20px";
  marker.style.zIndex = "1000";

  document.body.appendChild(marker);
}

// Remove all markers from the page
function removeAllMarkers() {
  document.querySelectorAll('[class^="marker-"]').forEach((el) => el.remove());
}

// Update the coordinate list display
function updateCoordinateList() {
  coordinates.forEach((coord, index) => {
    console.log(
      `Point ${index + 1}: x=${coord.x.toFixed(2)}, y=${coord.y.toFixed(2)}`,
    );
  });
}

// Send to API with the current image and coordinates
async function _sendToAPI() {
  const imageElement = document.getElementById("uploaded-image");
  const imageData = imageElement.src;

  if (typeof coordinates === "undefined" || coordinates.length !== 4) {
    alert("Please place exactly 4 points on the image");
    return;
  }

  // Show loading state
  const continueButton = document.querySelector(".control-button.primary");
  if (continueButton) {
    continueButton.disabled = true;
    continueButton.querySelector("span").textContent = "Processing...";
  }

  try {
    const response = await fetch("http://localhost:5000/process-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageData: imageData,
        coordinates: coordinates,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);

    if (data.success) {
      imageElement.src = data.processedImage;
      // Optional: Display area to user
      showResultMessage(`Area: ${data.area.toFixed(2)} px²`);
    } else {
      throw new Error(data.error || "Unknown error occurred");
    }
  } catch (error) {
    console.error("API Error:", error);
    showResultMessage(`Failed to process image: ${error.message}`, true);
  } finally {
    // Reset button state
    if (continueButton) {
      continueButton.disabled = false;
      continueButton.querySelector("span").textContent = "Submit";
    }
  }
}

function showResultMessage(message, isError = false) {
  // Remove any existing messages
  const existingMsg = document.getElementById("api-result-message");
  if (existingMsg) existingMsg.remove();

  const msgElement = document.createElement("div");
  msgElement.id = "api-result-message";
  msgElement.className = `result-message ${isError ? "error" : "success"}`;
  msgElement.textContent = message;

  // Add to DOM (adjust selector as needed)
  document.body.appendChild(msgElement);

  // Auto-hide after 5 seconds
  setTimeout(() => {
    msgElement.remove();
  }, 5000);
}
