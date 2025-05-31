const pool = require('../config/database');

/**
 * Add a new user to the database
 * @param {string} awId - Appwrite user ID
 * @returns {Promise<Object>} The created user object
 */
const addUser = async (awId) => {
    try {
        const [result] = await pool.query(
            'INSERT INTO users (aw_id) VALUES (?)',
            [awId]
        );

        return {
            user_id: result.insertId,
            aw_id: awId
        };
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('User with this Appwrite ID already exists');
        }
        throw new Error('Error creating user: ' + error.message);
    }
};

/**
 * Get a user by their Appwrite ID
 * @param {string} awId - Appwrite user ID
 * @returns {Promise<Object|null>} The user object or null if not found
 */
const getUserByAppwriteId = async (awId) => {
    try {
        const [rows] = await pool.query(
            'SELECT user_id, aw_id FROM users WHERE aw_id = ?',
            [awId]
        );

        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        throw new Error('Error getting user: ' + error.message);
    }
};

module.exports = {
    addUser,
    getUserByAppwriteId
};
