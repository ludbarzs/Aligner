const express = require('express');
const router = express.Router();
const { savePreferences, getUserPreferences, deletePreferences } = require('../controllers/prefrenceController');

// Route to save or update preferences
router.post('/', async (req, res) => {
    try {
        console.log('Received preferences data:', req.body);
        
        if (!req.body.userId) {
            console.log('Missing userId in request');
            return res.status(400).json({ message: 'userId is required' });
        }

        const preferences = {
            userId: req.body.userId,
            gaussianBlur: req.body.gaussianBlur,
            cannyThreshold1: req.body.cannyThreshold1,
            cannyThreshold2: req.body.cannyThreshold2,
            morphKernelSize: req.body.morphKernelSize
        };

        console.log('Attempting to save preferences:', preferences);
        const savedPreferences = await savePreferences(preferences);
        console.log('Preferences saved successfully:', savedPreferences);
        
        res.status(201).json(savedPreferences);
    } catch (error) {
        console.error('Error in POST /preferences:', error);
        res.status(500).json({ message: error.message });
    }
});

// Route to get user preferences
router.get('/user/:userId', async (req, res) => {
    try {
        console.log('Getting preferences for user:', req.params.userId);
        const { userId } = req.params;
        const preferences = await getUserPreferences(parseInt(userId));
        
        if (!preferences) {
            console.log('No preferences found for user:', userId);
            return res.status(404).json({ message: 'No preferences found for this user' });
        }
        
        console.log('Found preferences:', preferences);
        res.json(preferences);
    } catch (error) {
        console.error('Error in GET /preferences/user/:userId:', error);
        res.status(500).json({ message: error.message });
    }
});

// Route to delete user preferences
router.delete('/user/:userId', async (req, res) => {
    try {
        console.log('Deleting preferences for user:', req.params.userId);
        const { userId } = req.params;
        const result = await deletePreferences(parseInt(userId));
        
        if (!result) {
            console.log('No preferences found to delete for user:', userId);
            return res.status(404).json({ message: 'No preferences found to delete' });
        }
        
        console.log('Preferences deleted successfully for user:', userId);
        res.json({ success: true, message: 'Preferences deleted successfully' });
    } catch (error) {
        console.error('Error in DELETE /preferences/user/:userId:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
