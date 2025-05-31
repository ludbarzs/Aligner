const express = require("express");
const router = express.Router();
const {
  addUser,
  getUserByAppwriteId,
} = require("../controllers/userController");

// Route to add a new user
router.post("/", async (req, res) => {
  try {
    const { awId } = req.body;
    if (!awId) {
      return res.status(400).json({ message: "Appwrite ID is required" });
    }

    const user = await addUser(awId);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to get user by Appwrite ID
router.get("/appwrite/:awId", async (req, res) => {
  try {
    const { awId } = req.params;
    const user = await getUserByAppwriteId(awId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

