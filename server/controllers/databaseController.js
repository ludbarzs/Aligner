const pool = require("../config/database");

/**
 * Register a new user in the database
 * @param {string} userId - User ID (can be same as awId)
 * @param {string} awId - Appwrite user ID
 * @returns {Promise<Object>} The created user object
 */
const registerUser = async (userId, awId) => {
  try {
    // Use awId as the primary identifier if userId is not provided
    const userIdToUse = userId || awId;

    const [result] = await pool.query("INSERT INTO users (aw_id) VALUES (?)", [
      awId,
    ]);

    return {
      user_id: result.insertId,
      aw_id: awId,
    };
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw new Error("User with this Appwrite ID already exists");
    }
    throw new Error("Error creating user: " + error.message);
  }
};

/**
 * Save image data to the database
 */
const saveImage = async (
  imageData,
  userId,
  projectId = null,
  metadata = {},
) => {
  try {
    const [result] = await pool.query(
      `INSERT INTO images (user_id, project_id, base64_data, mime_type, file_size, filename, 
             real_width, real_height, corner_coordinates, transformations, x_ratio, y_ratio) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        projectId,
        imageData.base64Data,
        imageData.mimeType,
        imageData.fileSize,
        metadata.filename,
        metadata.realWidth,
        metadata.realHeight,
        JSON.stringify(metadata.cornerCoordinates || {}),
        JSON.stringify(metadata.transformations || {}),
        metadata.xRatio,
        metadata.yRatio,
      ],
    );

    return {
      image_id: result.insertId,
      user_id: userId,
      project_id: projectId,
    };
  } catch (error) {
    throw new Error("Error saving image: " + error.message);
  }
};

/**
 * Save preset data
 */
const savePreset = async (userId, presetData) => {
  try {
    const [result] = await pool.query(
      "INSERT INTO presets (user_id, preset_data) VALUES (?, ?)",
      [userId, JSON.stringify(presetData)],
    );

    return {
      preset_id: result.insertId,
      user_id: userId,
    };
  } catch (error) {
    throw new Error("Error saving preset: " + error.message);
  }
};

/**
 * Get user presets
 */
const getUserPresets = async (userId) => {
  try {
    const [rows] = await pool.query("SELECT * FROM presets WHERE user_id = ?", [
      userId,
    ]);

    return rows.map((row) => ({
      ...row,
      preset_data: JSON.parse(row.preset_data || "{}"),
    }));
  } catch (error) {
    throw new Error("Error fetching presets: " + error.message);
  }
};

/**
 * Get user preferences
 */
const getUserPreferences = async (userId) => {
  try {
    const [rows] = await pool.query(
      "SELECT preferences FROM users WHERE id = ?",
      [userId],
    );

    if (rows.length === 0) {
      throw new Error("User not found");
    }

    return JSON.parse(rows[0].preferences || "{}");
  } catch (error) {
    throw new Error("Error fetching user preferences: " + error.message);
  }
};

/**
 * Update user preferences
 */
const updateUserPreferences = async (userId, preferences) => {
  try {
    await pool.query("UPDATE users SET preferences = ? WHERE id = ?", [
      JSON.stringify(preferences),
      userId,
    ]);

    return { userId, preferences };
  } catch (error) {
    throw new Error("Error updating user preferences: " + error.message);
  }
};

module.exports = {
  registerUser,
  saveImage,
  savePreset,
  getUserPresets,
  getUserPreferences,
  updateUserPreferences,
};
