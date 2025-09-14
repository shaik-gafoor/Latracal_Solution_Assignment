import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { asyncHandler } from "../middleware/error.js";
import {
  validateUserRegistration,
  validateUserLogin,
} from "../middleware/validation.js";

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and password are required",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match",
    });
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({
      success: false,
      message: "An account with this email already exists",
    });
  }

  // Create user - use name as username for simplicity
  const user = await User.create({
    username: name, // Frontend sends 'name', we store as 'username'
    email,
    password,
    bio: "",
    favoriteGenres: [],
  });

  if (user) {
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        token,
        user: {
          id: user._id, // Frontend expects 'id'
          name: user.username, // Frontend expects 'name'
          email: user.email,
        },
      },
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Invalid user data",
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  // Check for user
  const user = await User.findOne({ email }).select("+password");

  if (user && (await user.correctPassword(password, user.password))) {
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id, // Frontend expects 'id'
          name: user.username, // Frontend expects 'name'
          email: user.email,
        },
      },
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({
    success: true,
    data: {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        favoriteGenres: user.favoriteGenres,
        profilePicture: user.profilePicture,
        joinDate: user.joinDate,
        stats: user.stats,
        isAdmin: user.isAdmin,
      },
    },
  });
});

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Current password and new password are required",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 6 characters long",
    });
  }

  // Get user with password
  const user = await User.findById(req.user._id).select("+password");

  // Check current password
  if (!(await user.correctPassword(currentPassword, user.password))) {
    return res.status(400).json({
      success: false,
      message: "Current password is incorrect",
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  const token = generateToken(user._id);

  res.json({
    success: true,
    message: "Password updated successfully",
    data: {
      token,
    },
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "No user found with that email",
    });
  }

  // In a real application, you would send an email with reset link
  // For now, we'll just return a success message
  res.json({
    success: true,
    message: "Password reset email sent (feature not implemented in demo)",
  });
});

// Routes
router.post("/register", validateUserRegistration, register);
router.post("/login", validateUserLogin, login);
router.get("/me", protect, getMe);
router.put("/password", protect, updatePassword);
router.post("/forgot-password", forgotPassword);

// Import protect middleware
import { protect } from "../middleware/auth.js";

export default router;
