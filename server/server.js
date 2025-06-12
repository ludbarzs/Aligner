const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const imageRoutes = require("./routes/imageRoutes");
const preferenceRoutes = require("./routes/prefrenceRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/preferences", preferenceRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Function to print available routes
function printRoutes() {
  console.log("Available routes:");
  console.log("- GET  /");
  console.log("- POST /api/users");
  console.log("- POST /api/images");
  console.log("- PUT  /api/images/:imageId");
  console.log("- GET  /api/images/user/:userId");
  console.log("- GET  /api/images/:imageId");
  console.log("- DELETE /api/images/:imageId");
  console.log("- POST /api/preferences");
  console.log("- GET  /api/preferences/user/:userId");
  console.log("- DELETE /api/preferences/user/:userId");
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  printRoutes();
});

