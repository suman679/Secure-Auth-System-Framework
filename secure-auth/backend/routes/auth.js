// ==============================================
// routes/auth.js - All Authentication Routes
// ==============================================
// This file handles: Register, Login, OTP, Dashboard

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");       // For hashing passwords
const jwt = require("jsonwebtoken");       // For creating tokens
const nodemailer = require("nodemailer"); // For sending emails
const User = require("../models/User");   // Our User model
const verifyToken = require("../middleware/auth"); // JWT middleware

// ─────────────────────────────────────────────
// HELPER: Create the email transporter
// Uses Gmail with App Password from .env
// ─────────────────────────────────────────────
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// ─────────────────────────────────────────────
// HELPER: Generate a random 6-digit OTP
// ─────────────────────────────────────────────
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ─────────────────────────────────────────────
// POST /api/auth/register
// Handles new user registration
// ─────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // Basic validation
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    // Check if user already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already registered. Please login." });
    }

    // Hash the password using bcrypt (10 = salt rounds, higher = more secure but slower)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const newUser = new User({
      email,
      password: hashedPassword,
    });
    await newUser.save();

    res.status(201).json({ message: "Registration successful! You can now login." });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/login
// Step 1: Validate credentials, then send OTP
// ─────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not registered. Please sign up first." });
    }

    // Compare entered password with the hashed one in DB
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Wrong password. Please try again." });
    }

    // Credentials are correct — now generate and send OTP
    const otp = generateOTP();

    // OTP expires in 5 minutes from now
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    // Save OTP and expiry to the user's record in DB
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send the OTP via email
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"SecureAuth" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP for Login - SecureAuth",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto; padding: 30px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #6c63ff;">SecureAuth - Login OTP</h2>
          <p>Hello,</p>
          <p>Your One-Time Password (OTP) for login is:</p>
          <h1 style="color: #6c63ff; font-size: 40px; letter-spacing: 8px;">${otp}</h1>
          <p>This OTP is valid for <strong>5 minutes</strong>.</p>
          <p>If you did not request this, please ignore this email.</p>
          <hr>
          <small style="color: #999;">SecureAuth System - College Project</small>
        </div>
      `,
    });

    res.status(200).json({ message: "OTP sent to your email. Please verify." });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/verify-otp
// Step 2: Verify OTP, issue JWT token
// ─────────────────────────────────────────────
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      return res.status(401).json({ message: "Invalid OTP. Please try again." });
    }

    // Check if OTP has expired
    if (new Date() > user.otpExpiry) {
      // Clear the expired OTP
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      return res.status(401).json({ message: "OTP has expired. Please login again." });
    }

    // OTP is valid! Clear it from the database (one-time use)
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Create a JWT token that expires in 1 hour
    const token = jwt.sign(
      { userId: user._id, email: user.email }, // Payload (data inside token)
      process.env.JWT_SECRET,                   // Secret key
      { expiresIn: "1h" }                       // Expiry
    );

    res.status(200).json({
      message: "Login successful!",
      token,
      user: { email: user.email },
    });

  } catch (error) {
    console.error("OTP Verify Error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// ─────────────────────────────────────────────
// GET /api/auth/dashboard
// Protected route - only accessible with valid JWT
// ─────────────────────────────────────────────
router.get("/dashboard", verifyToken, async (req, res) => {
  try {
    // req.user is set by the verifyToken middleware
    const user = await User.findById(req.user.userId).select("-password -otp -otpExpiry");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "Welcome to your Dashboard!",
      user: {
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
