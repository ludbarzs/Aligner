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
    
    try {
        await connection.beginTransaction();

        // Check if user already has preferences
        const [existing] = await connection.query(
            "SELECT preset_id FROM edge_detection_preferences WHERE user_id = ?",
            [preferences.userId]
        );

        let result;
        if (existing.length > 0) {
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

        await connection.commit();
        return { ...preferences, presetId: result.insertId || existing[0].preset_id };
    } catch (error) {
        await connection.rollback();
        throw new Error("Error saving preferences: " + error.message);
    } finally {
        connection.release();
    }
};

/**
 * Get user's edge detection preferences
 * @param {number} userId The ID of the user
 * @returns {Promise<Object>} User's preferences object
 */
const getUserPreferences = async (userId) => {
    try {
        const [rows] = await pool.query(
            `SELECT * FROM edge_detection_preferences WHERE user_id = ?`,
            [userId]
        );

        if (rows.length === 0) {
            return null;
        }

        return rows[0];
    } catch (error) {
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
        const [result] = await pool.query(
            "DELETE FROM edge_detection_preferences WHERE user_id = ?",
            [userId]
        );
        return result.affectedRows > 0;
    } catch (error) {
        throw new Error("Error deleting preferences: " + error.message);
    }
};

module.exports = {
    savePreferences,
    getUserPreferences,
    deletePreferences
};
