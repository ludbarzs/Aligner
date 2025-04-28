// Store coordinates
let coordinates = [];
let imageElement = document.getElementById("uploadedImage");
let uploadInterface = document.getElementById("uploadInterface");

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
      updateCoordinateList();
    };

    reader.readAsDataURL(file);
  }
});

// Handle clicks on the image
imageElement.addEventListener("click", function (e) {
  if (coordinates.length >= 4) {
    alert(
      "You have already selected 4 points. Refresh the page to start over.",
    );
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

// Update the coordinate list display
function updateCoordinateList() {
  coordinates.forEach((coord, index) => {
    console.log(coord);
  });
}

// You would call this function when ready to send to your Python API
function sendToAPI() {
  console.log("Coordinates to send:", coordinates);
}
