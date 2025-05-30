const pool = require('../config/database');

/**
 * Add a new image with its associated data
 * @param {Object} imageData Object containing all image information
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
 * @returns {Promise<Object>} The created image object with its ID
 */
const addImage = async (imageData) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        // First, insert the image data
        const [imageDataResult] = await connection.query(
            'INSERT INTO images_data (base64_data, mime_type) VALUES (?, ?)',
            [imageData.base64Data, imageData.mimeType]
        );

        const imageDataId = imageDataResult.insertId;

        // Then, insert the image metadata
        const [imageResult] = await connection.query(
            `INSERT INTO images (
                id_user,
                id_image_data,
                real_width_mm,
                real_height_mm,
                corner_coordinates,
                transformations,
                x_ratio,
                y_ratio,
                gaussian_blur,
                canny_threshold_1,
                canny_threshold_2
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                imageData.userId,
                imageDataId,
                imageData.realWidthMm || null,
                imageData.realHeightMm || null,
                imageData.cornerCoordinates ? JSON.stringify(imageData.cornerCoordinates) : null,
                imageData.transformations ? JSON.stringify(imageData.transformations) : null,
                imageData.xRatio || null,
                imageData.yRatio || null,
                imageData.gaussianBlur || null,
                imageData.cannyThreshold1 || null,
                imageData.cannyThreshold2 || null
            ]
        );

        await connection.commit();

        return {
            imageId: imageResult.insertId,
            imageDataId: imageDataId,
            ...imageData
        };

    } catch (error) {
        await connection.rollback();
        throw new Error('Error creating image: ' + error.message);
    } finally {
        connection.release();
    }
};

/**
 * Get an image by its ID
 * @param {number} imageId The ID of the image to retrieve
 * @returns {Promise<Object>} The image object with its data
 */
const getImageById = async (imageId) => {
    try {
        const [rows] = await pool.query(
            `SELECT 
                i.*,
                id.base64_data,
                id.mime_type
            FROM images i
            JOIN images_data id ON i.id_image_data = id.image_data_id
            WHERE i.image_id = ?`,
            [imageId]
        );

        if (rows.length === 0) {
            throw new Error('Image not found');
        }

        const image = rows[0];
        // Parse JSON fields
        if (image.corner_coordinates) {
            image.corner_coordinates = JSON.parse(image.corner_coordinates);
        }
        if (image.transformations) {
            image.transformations = JSON.parse(image.transformations);
        }

        return image;
    } catch (error) {
        throw new Error('Error retrieving image: ' + error.message);
    }
};

/**
 * Get all images for a user
 * @param {number} userId The ID of the user
 * @returns {Promise<Array>} Array of image objects
 */
const getUserImages = async (userId) => {
    try {
        const [rows] = await pool.query(
            `SELECT 
                i.*,
                id.mime_type
            FROM images i
            JOIN images_data id ON i.id_image_data = id.image_data_id
            WHERE i.id_user = ?
            ORDER BY i.created_at DESC`,
            [userId]
        );

        return rows.map(row => {
            if (row.corner_coordinates) {
                row.corner_coordinates = JSON.parse(row.corner_coordinates);
            }
            if (row.transformations) {
                row.transformations = JSON.parse(row.transformations);
            }
            return row;
        });
    } catch (error) {
        throw new Error('Error retrieving user images: ' + error.message);
    }
};

/**
 * Delete an image and its associated data
 * @param {number} imageId The ID of the image to delete
 * @param {number} userId The ID of the user (for authorization)
 * @returns {Promise<boolean>} True if deletion was successful
 */
const deleteImage = async (imageId, userId) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        // First verify the image belongs to the user
        const [images] = await connection.query(
            'SELECT id_image_data FROM images WHERE image_id = ? AND id_user = ?',
            [imageId, userId]
        );

        if (images.length === 0) {
            throw new Error('Image not found or unauthorized');
        }

        const imageDataId = images[0].id_image_data;

        // Delete the image (this will cascade to delete the image_data due to FK constraints)
        await connection.query(
            'DELETE FROM images WHERE image_id = ?',
            [imageId]
        );

        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        throw new Error('Error deleting image: ' + error.message);
    } finally {
        connection.release();
    }
};

/**
 * Update an existing image and its associated data
 * @param {number} imageId The ID of the image to update
 * @param {Object} imageData Updated image data
 * @returns {Promise<Object>} The updated image object
 */
const updateImage = async (imageId, imageData) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        console.log('Updating image:', imageId, 'for user:', imageData.userId);

        // First, verify the image exists and belongs to the user
        const [images] = await connection.query(
            'SELECT id_image_data FROM images WHERE image_id = ? AND id_user = ?',
            [imageId, imageData.userId]
        );

        if (images.length === 0) {
            console.error('Image not found or unauthorized. ID:', imageId, 'User:', imageData.userId);
            throw new Error('Image not found or unauthorized');
        }

        const imageDataId = images[0].id_image_data;
        console.log('Found image data ID:', imageDataId);

        // Update the image data
        await connection.query(
            'UPDATE images_data SET base64_data = ?, mime_type = ? WHERE image_data_id = ?',
            [imageData.base64Data, imageData.mimeType, imageDataId]
        );
        console.log('Updated image_data table');

        // Update the image metadata
        const updateResult = await connection.query(
            `UPDATE images SET
                real_width_mm = ?,
                real_height_mm = ?,
                corner_coordinates = ?,
                transformations = ?,
                gaussian_blur = ?,
                canny_threshold_1 = ?,
                canny_threshold_2 = ?
            WHERE image_id = ?`,
            [
                imageData.realWidthMm || null,
                imageData.realHeightMm || null,
                imageData.cornerCoordinates ? JSON.stringify(imageData.cornerCoordinates) : null,
                imageData.transformations ? JSON.stringify(imageData.transformations) : null,
                imageData.gaussianBlur || null,
                imageData.cannyThreshold1 || null,
                imageData.cannyThreshold2 || null,
                imageId
            ]
        );
        console.log('Updated images table');

        await connection.commit();
        console.log('Transaction committed');

        // Return the updated image data
        const [updatedImage] = await connection.query(
            `SELECT i.*, id.mime_type
            FROM images i
            JOIN images_data id ON i.id_image_data = id.image_data_id
            WHERE i.image_id = ?`,
            [imageId]
        );

        if (updatedImage.length === 0) {
            throw new Error('Failed to retrieve updated image data');
        }

        return updatedImage[0];

    } catch (error) {
        console.error('Error in updateImage:', error);
        await connection.rollback();
        throw new Error('Error updating image: ' + error.message);
    } finally {
        connection.release();
    }
};

module.exports = {
    addImage,
    getImageById,
    getUserImages,
    deleteImage,
    updateImage
}; 