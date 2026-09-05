// ==============================================
// models/User.js - Database Schema for Users
// ==============================================
// This defines the shape of our user data in MongoDB

const mongoose = require("mongoose");

// Define what a "User" looks like in the database
const userSchema = new mongoose.Schema({
  // Email used as username - must be unique
  email: {
    type: String,
    required: true,   // Cannot be empty
    unique: true,     // No two users with same email
    lowercase: true,  // Always store in lowercase
    trim: true,       // Remove extra spaces
  },

  // Hashed password (never store plain text!)
  password: {
    type: String,
    required: true,
  },

  // OTP fields for email verification (MFA)
  otp: {
    type: String,
    default: null,    // null means no OTP pending
  },

  otpExpiry: {
    type: Date,
    default: null,    // Stores when OTP expires
  },

  // When was this account created
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Export the model so other files can use it
module.exports = mongoose.model("User", userSchema);
