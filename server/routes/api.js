const express = require('express');
const router = express.Router();
const databaseController = require('../controllers/databaseController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// User Registration
router.post('/users/register', async (req, res) => {
    try {
        const { userId, awId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }
        
        const result = await databaseController.registerUser(userId, awId);
        res.status(201).json({ 
            success: true, 
            message: 'User registered successfully',
            data: result 
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Image Upload
router.post('/images/upload', upload.single('image'), async (req, res) => {
    try {
        const { userId, projectId } = req.body;
        if (!userId || !req.file) {
            return res.status(400).json({ error: 'userId and image are required' });
        }

        const imageData = {
            base64Data: req.file.buffer.toString('base64'),
            mimeType: req.file.mimetype,
            fileSize: req.file.size
        };

        const metadata = {
            filename: req.file.originalname,
            realWidth: parseFloat(req.body.realWidth) || null,
            realHeight: parseFloat(req.body.realHeight) || null,
            cornerCoordinates: req.body.cornerCoordinates ? JSON.parse(req.body.cornerCoordinates) : {},
            transformations: req.body.transformations ? JSON.parse(req.body.transformations) : {},
            xRatio: parseFloat(req.body.xRatio) || null,
            yRatio: parseFloat(req.body.yRatio) || null
        };

        const result = await databaseController.saveImage(imageData, userId, projectId || null, metadata);
        res.status(201).json({
            success: true,
            message: 'Image uploaded successfully',
            data: result
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// Save Preset
router.post('/presets', async (req, res) => {
    try {
        const { userId, presetData } = req.body;
        if (!userId || !presetData) {
            return res.status(400).json({ error: 'userId and presetData are required' });
        }

        const result = await databaseController.savePreset(userId, presetData);
        res.status(201).json({
            success: true,
            message: 'Preset saved successfully',
            data: result
        });
    } catch (error) {
        console.error('Error saving preset:', error);
        res.status(500).json({ error: 'Failed to save preset' });
    }
});

// Get User Presets
router.get('/presets/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const presets = await databaseController.getUserPresets(userId);
        res.json({
            success: true,
            data: presets
        });
    } catch (error) {
        console.error('Error fetching presets:', error);
        res.status(500).json({ error: 'Failed to fetch presets' });
    }
});

// Get User Preferences
router.get('/preferences/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const preferences = await databaseController.getUserPreferences(userId);
        res.json({
            success: true,
            data: preferences
        });
    } catch (error) {
        console.error('Error fetching user preferences:', error);
        res.status(500).json({ error: 'Failed to fetch user preferences' });
    }
});

// Update User Preferences
router.put('/preferences/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const preferences = req.body;
        
        if (!userId || !preferences) {
            return res.status(400).json({ error: 'userId and preferences data are required' });
        }

        const result = await databaseController.updateUserPreferences(userId, preferences);
        res.json({
            success: true,
            message: 'User preferences updated successfully',
            data: result
        });
    } catch (error) {
        console.error('Error updating user preferences:', error);
        res.status(500).json({ error: 'Failed to update user preferences' });
    }
});

module.exports = router; 