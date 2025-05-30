class ImageController {
    constructor(baseUrl = 'http://localhost:3000/api') {
        this.baseUrl = baseUrl;
    }

    /**
     * Save an image with its associated data
     * @param {Object} imageData Object containing image information
     * @param {string} imageData.base64Data Base64 encoded image data
     * @param {string} imageData.mimeType Image MIME type
     * @param {number} imageData.userId User ID who owns the image
     * @param {number} [imageData.realWidthMm] Real width in millimeters
     * @param {number} [imageData.realHeightMm] Real height in millimeters
     * @param {Object} [imageData.cornerCoordinates] Corner coordinates data
     * @param {Object} [imageData.transformations] Image transformation data
     * @param {number} [imageData.xRatio] X-axis scaling ratio
     * @param {number} [imageData.yRatio] Y-axis scaling ratio
     * @param {number} [imageData.gaussianBlur] Gaussian blur parameter
     * @param {number} [imageData.cannyThreshold1] First Canny threshold value
     * @param {number} [imageData.cannyThreshold2] Second Canny threshold value
     * @returns {Promise<Object>} The saved image data with ID
     */
    async saveImage(imageData) {
        try {
            const response = await fetch(`${this.baseUrl}/images`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(imageData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error saving image:', error);
            throw error;
        }
    }

    /**
     * Get all images for a user
     * @param {number} userId The ID of the user
     * @returns {Promise<Array>} Array of image objects
     */
    async getUserImages(userId) {
        try {
            const response = await fetch(`${this.baseUrl}/images/user/${userId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting user images:', error);
            throw error;
        }
    }

    /**
     * Get a single image by ID
     * @param {number} imageId The ID of the image to retrieve
     * @returns {Promise<Object>} The image object
     */
    async getImage(imageId) {
        try {
            const response = await fetch(`${this.baseUrl}/images/${imageId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting image:', error);
            throw error;
        }
    }

    /**
     * Delete an image
     * @param {number} imageId The ID of the image to delete
     * @param {number} userId The ID of the user (for authorization)
     * @returns {Promise<boolean>} True if deletion was successful
     */
    async deleteImage(imageId, userId) {
        try {
            const response = await fetch(`${this.baseUrl}/images/${imageId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting image:', error);
            throw error;
        }
    }

    /**
     * Export the processed image with all its data
     * @param {Object} exportData Object containing final image data
     * @param {string} exportData.imageDataUrl The processed image as a data URL (base64)
     * @param {string} exportData.userId The ID of the logged-in user
     * @param {Object} exportData.dimensions The real dimensions of the image
     * @param {number} exportData.dimensions.width Real width in millimeters
     * @param {number} exportData.dimensions.height Real height in millimeters
     * @param {Object} exportData.cornerPoints The detected corner coordinates
     * @param {Object} exportData.transformationMatrix The perspective transformation matrix
     * @param {Object} exportData.edgeDetection Edge detection parameters used
     * @param {number} exportData.edgeDetection.gaussianBlur Gaussian blur value
     * @param {number} exportData.edgeDetection.cannyThreshold1 First Canny threshold
     * @param {number} exportData.edgeDetection.cannyThreshold2 Second Canny threshold
     * @param {Object} exportData.scaling The scaling ratios
     * @param {number} exportData.scaling.xRatio X-axis scaling ratio
     * @param {number} exportData.scaling.yRatio Y-axis scaling ratio
     * @returns {Promise<Object>} The saved image data with generated IDs
     */
    async exportImage(exportData) {
        // Extract the MIME type from the data URL
        const mimeType = exportData.imageDataUrl.split(';')[0].split(':')[1];
        
        // Extract the base64 data without the data URL prefix
        const base64Data = exportData.imageDataUrl.split(',')[1];

        // Prepare the image data for the server
        const imageData = {
            base64Data: base64Data,
            mimeType: mimeType,
            userId: exportData.userId,
            realWidthMm: exportData.dimensions.width,
            realHeightMm: exportData.dimensions.height,
            cornerCoordinates: exportData.cornerPoints,
            transformations: exportData.transformationMatrix,
            xRatio: exportData.scaling.xRatio,
            yRatio: exportData.scaling.yRatio,
            gaussianBlur: exportData.edgeDetection.gaussianBlur,
            cannyThreshold1: exportData.edgeDetection.cannyThreshold1,
            cannyThreshold2: exportData.edgeDetection.cannyThreshold2
        };

        try {
            return await this.saveImage(imageData);
        } catch (error) {
            console.error('Error exporting image:', error);
            throw new Error('Failed to export image: ' + error.message);
        }
    }
}

export default ImageController;

