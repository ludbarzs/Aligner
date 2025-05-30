import { AppState } from '../app_state.js';
import { appwriteService } from '../../authentication/services/appwrite-service.js';

export class ImageController {
  static API_BASE_URL = 'http://localhost:3000/api';

  /**
   * Saves or updates the current app state as an image entry in the database
   * @param {number} userId - The ID of the user saving the image
   * @returns {Promise<Object>} The saved image data
   */
  static async saveCurrentState(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const allValues = AppState.getAllValues();
    const currentImage = allValues.currentImage;
    const currentImageId = AppState.getCurrentImageId();
    
    if (!currentImage) {
      throw new Error('No image data available to save');
    }

    console.log('Saving state with image ID:', currentImageId);

    // Prepare the image data object
    const imageData = {
      userId: userId,
      base64Data: currentImage,
      mimeType: 'image/png', // Assuming PNG format, adjust if needed
      cornerCoordinates: allValues.coordinates,
      transformations: allValues.transformations,
      realWidthMm: allValues.drawerDimensions.width,
      realHeightMm: allValues.drawerDimensions.height,
      // Edge detection settings
      ...(allValues.edgeDetectionSettings || {})
    };

    try {
      let response;
      let url = `${this.API_BASE_URL}/images`;
      let method = 'POST';
      
      if (currentImageId) {
        // Update existing image
        url = `${this.API_BASE_URL}/images/${currentImageId}`;
        method = 'PUT';
        console.log('Updating existing image at:', url);
      } else {
        console.log('Creating new image at:', url);
      }

      response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(imageData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', response.status, errorText);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      const savedImage = await response.json();
      console.log('Save successful:', savedImage);
      
      // Store the image ID for future updates
      if (!currentImageId && savedImage.imageId) {
        console.log('Setting new image ID:', savedImage.imageId);
        AppState.setCurrentImageId(savedImage.imageId);
      }

      return savedImage;
    } catch (error) {
      console.error('Error saving image:', error);
      throw error;
    }
  }

  /**
   * Retrieves all images for a specific user
   * @param {number} userId - The ID of the user
   * @returns {Promise<Array>} Array of user's images
   */
  static async getUserImages(userId) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/images/user/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user images');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user images:', error);
      throw error;
    }
  }

  /**
   * Deletes an image
   * @param {number} imageId - The ID of the image to delete
   * @param {number} userId - The ID of the user
   * @returns {Promise<void>}
   */
  static async deleteImage(imageId, userId) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  /**
   * Gets all images for the currently logged in user
   * @returns {Promise<Array>} Array of user's images
   * @throws {Error} If user is not logged in or if fetching images fails
   */
  static async getCurrentUserImages() {
    try {
      // Get the current user from Appwrite
      const user = await appwriteService.getCurrentUser();
      if (!user) {
        throw new Error('No user is currently logged in');
      }

      // Get the user's local database ID
      const response = await fetch(`${this.API_BASE_URL}/users/appwrite/${user.$id}`);
      if (!response.ok) {
        throw new Error('Failed to get user ID from local database');
      }
      const userData = await response.json();

      // Get all images for this user
      return await this.getUserImages(userData.user_id);
    } catch (error) {
      console.error('Error fetching current user images:', error);
      throw error;
    }
  }
}
