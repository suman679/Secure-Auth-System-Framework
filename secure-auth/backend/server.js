// ==============================================
// server.js - Main Backend Entry Point
// ==============================================
// This is where our Express server starts up

// Load environment variables from .env file FIRST
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

// Import our auth routes
const authRoutes = require("./routes/auth");

// Create Express app
const app = express();

// ─────────────────────────────────────────────
// MIDDLEWARE SETUP
// Middleware runs on every request before routes
// ─────────────────────────────────────────────

// Allow requests from our frontend (CORS)
app.use(cors({
  origin: "*", // In production, replace with your actual frontend URL
  methods: ["GET", "POST"],
}));

// Parse incoming JSON data (req.body)
app.use(express.json());

// Serve frontend static files
// This lets Express serve our HTML/CSS/JS files
app.use(express.static(path.join(__dirname, "../frontend")));

// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────

// All auth routes start with /api/auth
// Example: /api/auth/register, /api/auth/login
app.use("/api/auth", authRoutes);

// Serve frontend pages (catch-all)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dashboard.html"));
});

// ─────────────────────────────────────────────
// CONNECT TO MONGODB & START SERVER
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB successfully!");

    // Start the server only after DB connection is ready
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`📁 Frontend: http://localhost:${PORT}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api/auth`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1); // Stop the server if DB fails
  });
