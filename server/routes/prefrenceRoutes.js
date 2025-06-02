const express = require('express');
const router = express.Router();
const { savePreferences, getUserPreferences, deletePreferences } = require('../controllers/prefrenceController');

// Route to save or update preferences
router.post('/', async (req, res) => {
    try {
        const preferences = req.body;
        const savedPreferences = await savePreferences(preferences);
        res.status(201).json(savedPreferences);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route to get user preferences
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const preferences = await getUserPreferences(parseInt(userId));
        
        if (!preferences) {
            return res.status(404).json({ message: 'No preferences found for this user' });
        }
        
        res.json(preferences);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route to delete user preferences
router.delete('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await deletePreferences(parseInt(userId));
        
        if (!result) {
            return res.status(404).json({ message: 'No preferences found to delete' });
        }
        
        res.json({ success: true, message: 'Preferences deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
