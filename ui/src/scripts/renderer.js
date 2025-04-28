// Store coordinates
let coordinates = [];
let imageElement = document.getElementById("uploadedImage");
let uploadInterface = document.getElementById("uploadInterface");

// Initialize global variable for dot placement permission
window.allowDotPlacement = false;

// Handle image upload
document.getElementById("imageUpload").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();

    reader.onload = function (event) {
      imageElement.src = event.target.result;
      imageElement.style.display = "block";
      uploadInterface.style.display = "none";
      // Show all control buttons
      document.querySelectorAll(".control-button").forEach((button) => {
        button.style.display = "flex";
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
      window.allowDotPlacement = false;
    };

    reader.readAsDataURL(file);
  }
});

// Handle clicks on the image
imageElement.addEventListener("click", function (e) {
  // Only allow placing dots if we're in step 2
  if (!window.allowDotPlacement) {
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
  marker.textContent = number;

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
function sendToAPI() {
  // Check if we have all 4 points
  if (coordinates.length < 4) {
    alert("Please place 4 points on the image before submitting.");
    return;
  }

  // Get the current processed image data
  const imageData =
    typeof getProcessedImageData === "function"
      ? getProcessedImageData()
      : imageElement.src;

  console.log("Coordinates to send:", coordinates);
  console.log("Image data is ready to send to API");

  // Here you would make your API call with the image data and coordinates
  // Example:
  /*
  fetch('your-api-endpoint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      imageData: imageData,
      coordinates: coordinates
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
  */
}
