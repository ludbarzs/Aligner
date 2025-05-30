const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const imageRoutes = require("./routes/imageRoutes");

const app = express();

// Middleware
app.use(cors());
// Increase JSON payload limit for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Add basic route for testing
app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/images", imageRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log("Available routes:");
  console.log("- GET  /");
  console.log("- POST /api/users");
  console.log("- POST /api/images");
  console.log("- GET  /api/images/user/:userId");
  console.log("- GET  /api/images/:imageId");
  console.log("- DELETE /api/images/:imageId");
});

