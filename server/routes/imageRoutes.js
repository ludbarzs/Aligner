const express = require('express');
const router = express.Router();
const { addImage, getImageById, getUserImages, deleteImage, updateImage } = require('../controllers/imageController');

// Route to add a new image
router.post('/', async (req, res) => {
    try {
        const imageData = req.body;
        const image = await addImage(imageData);
        res.status(201).json(image);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route to update an image
router.put('/:imageId', async (req, res) => {
    try {
        const { imageId } = req.params;
        const imageData = req.body;
        const updatedImage = await updateImage(parseInt(imageId), imageData);
        res.json(updatedImage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route to get all images for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const images = await getUserImages(parseInt(userId));
        res.json(images);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route to get a single image
router.get('/:imageId', async (req, res) => {
    try {
        const { imageId } = req.params;
        const image = await getImageById(parseInt(imageId));
        res.json(image);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route to delete an image
router.delete('/:imageId', async (req, res) => {
    try {
        const { imageId } = req.params;
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const result = await deleteImage(parseInt(imageId), parseInt(userId));
        res.json({ success: result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 