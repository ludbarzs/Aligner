const pool = require("../config/database");

/**
 * Get internal user_id from Appwrite ID
 */
async function getInternalUserId(appwriteId) {
    try {
        const [rows] = await pool.query(
            "SELECT user_id FROM users WHERE aw_id = ?",
            [appwriteId]
        );
        
        if (rows.length === 0) {
            throw new Error(`No user found with Appwrite ID: ${appwriteId}`);
        }
        
        return rows[0].user_id;
    } catch (error) {
        throw new Error(`Error getting internal user ID: ${error.message}`);
    }
}

/**
 * Save or update user's edge detection preferences
 */
const savePreferences = async (preferences) => {
    const connection = await pool.getConnection();
    console.log('Got database connection');
    
    try {
        await connection.beginTransaction();
        console.log('Started transaction');

        // Get internal user_id from Appwrite ID
        const internalUserId = await getInternalUserId(preferences.userId);
        console.log('Got internal user_id:', internalUserId);

        // Check if user already has preferences
        console.log('Checking for existing preferences for user:', internalUserId);
        const [existing] = await connection.query(
            "SELECT preset_id FROM edge_detection_preferences WHERE user_id = ?",
            [internalUserId]
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
                    internalUserId
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
                    internalUserId,
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
        
        return { 
            ...preferences, 
            internalUserId,
            presetId: result.insertId || existing[0]?.preset_id 
        };
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
 */
const getUserPreferences = async (appwriteId) => {
    try {
        console.log('Getting preferences for Appwrite user:', appwriteId);
        
        // Get internal user_id first
        const internalUserId = await getInternalUserId(appwriteId);
        console.log('Got internal user_id:', internalUserId);

        const [rows] = await pool.query(
            `SELECT * FROM edge_detection_preferences WHERE user_id = ?`,
            [internalUserId]
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
 */
const deletePreferences = async (appwriteId) => {
    try {
        console.log('Deleting preferences for Appwrite user:', appwriteId);
        
        // Get internal user_id first
        const internalUserId = await getInternalUserId(appwriteId);
        console.log('Got internal user_id:', internalUserId);

        const [result] = await pool.query(
            "DELETE FROM edge_detection_preferences WHERE user_id = ?",
            [internalUserId]
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
