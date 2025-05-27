import { AppState } from '../../scripts/app_state.js';

// Get DOM elements
const imageElement = document.getElementById('edit-image');
const editContainer = document.querySelector('.edit-container');
const noImageMessage = document.querySelector('.no-image-message');

// Function to load image from AppState
function loadImageFromState() {
    const imageData = AppState.getCurrentImage();
    
    if (imageData) {
        try {
            // Display the image
            imageElement.src = imageData;
            imageElement.style.display = 'block';
            
            if (noImageMessage) {
                noImageMessage.style.display = 'none';
            }
            
            // Enable edit container if it exists
            if (editContainer) {
                editContainer.style.display = 'block';
            }

            // Add error handler for image loading failures
            imageElement.onerror = () => {
                console.error('Failed to load image data');
                handleNoImage('Failed to load image. Please try uploading again.');
            };
        } catch (error) {
            console.error('Error setting up image:', error);
            handleNoImage('Error loading image. Please try uploading again.');
        }
    } else {
        handleNoImage('No image found. Please upload an image first.');
    }
}

// Handle case where no image is available
function handleNoImage(message) {
    if (noImageMessage) {
        noImageMessage.textContent = message;
        noImageMessage.style.display = 'block';
    }
    if (imageElement) {
        imageElement.style.display = 'none';
    }
    if (editContainer) {
        editContainer.style.display = 'none';
    }
    
    // Redirect back to upload page after a short delay
    setTimeout(() => {
        window.location.href = '../image_upload/image_upload.html';
    }, 2000);
}

// Call loadImageFromState when the page loads
document.addEventListener('DOMContentLoaded', loadImageFromState);
