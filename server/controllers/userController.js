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

module.exports = {
    addUser
};
