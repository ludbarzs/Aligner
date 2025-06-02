const pool = require("../config/database");

/**
 * Save or update user's edge detection preferences
 * @param {Object} preferences Object containing user preferences
 * @param {number} preferences.userId User ID
 * @param {number} preferences.gaussianBlur Gaussian blur value
 * @param {number} preferences.cannyThreshold1 First Canny threshold
 * @param {number} preferences.cannyThreshold2 Second Canny threshold
 * @param {number} preferences.morphKernelSize Morphological operation kernel size
 * @returns {Promise<Object>} The saved preferences object
 */
const savePreferences = async (preferences) => {
    const connection = await pool.getConnection();
    console.log('Got database connection');
    
    try {
        await connection.beginTransaction();
        console.log('Started transaction');

        // Check if user already has preferences
        console.log('Checking for existing preferences for user:', preferences.userId);
        const [existing] = await connection.query(
            "SELECT preset_id FROM edge_detection_preferences WHERE user_id = ?",
            [preferences.userId]
        );
        console.log('Existing preferences check result:', existing);

        let result;
        if (existing.length > 0) {
            console.log('Updating existing preferences');
            // Update existing preferences
            [result] = await connection.query(
                `UPDATE edge_detection_preferences 
                SET gaussian_blur = ?,
                    canny_threshold_1 = ?,
                    canny_threshold_2 = ?,
                    morph_kernel_size = ?
                WHERE user_id = ?`,
                [
                    preferences.gaussianBlur,
                    preferences.cannyThreshold1,
                    preferences.cannyThreshold2,
                    preferences.morphKernelSize,
                    preferences.userId
                ]
            );
        } else {
            console.log('Inserting new preferences');
            // Insert new preferences
            [result] = await connection.query(
                `INSERT INTO edge_detection_preferences 
                (user_id, gaussian_blur, canny_threshold_1, canny_threshold_2, morph_kernel_size)
                VALUES (?, ?, ?, ?, ?)`,
                [
                    preferences.userId,
                    preferences.gaussianBlur,
                    preferences.cannyThreshold1,
                    preferences.cannyThreshold2,
                    preferences.morphKernelSize
                ]
            );
        }
        console.log('Query result:', result);

        await connection.commit();
        console.log('Transaction committed');
        
        return { ...preferences, presetId: result.insertId || existing[0]?.preset_id };
    } catch (error) {
        console.error('Error in savePreferences:', error);
        await connection.rollback();
        console.log('Transaction rolled back');
        throw new Error("Error saving preferences: " + error.message);
    } finally {
        connection.release();
        console.log('Connection released');
    }
};

/**
 * Get user's edge detection preferences
 * @param {number} userId The ID of the user
 * @returns {Promise<Object>} User's preferences object
 */
const getUserPreferences = async (userId) => {
    try {
        console.log('Getting preferences for user:', userId);
        const [rows] = await pool.query(
            `SELECT * FROM edge_detection_preferences WHERE user_id = ?`,
            [userId]
        );
        console.log('Query result:', rows);

        if (rows.length === 0) {
            console.log('No preferences found');
            return null;
        }

        return rows[0];
    } catch (error) {
        console.error('Error in getUserPreferences:', error);
        throw new Error("Error retrieving preferences: " + error.message);
    }
};

/**
 * Delete user's edge detection preferences
 * @param {number} userId The ID of the user
 * @returns {Promise<boolean>} True if deletion was successful
 */
const deletePreferences = async (userId) => {
    try {
        console.log('Deleting preferences for user:', userId);
        const [result] = await pool.query(
            "DELETE FROM edge_detection_preferences WHERE user_id = ?",
            [userId]
        );
        console.log('Delete result:', result);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error in deletePreferences:', error);
        throw new Error("Error deleting preferences: " + error.message);
    }
};

module.exports = {
    savePreferences,
    getUserPreferences,
    deletePreferences
};
