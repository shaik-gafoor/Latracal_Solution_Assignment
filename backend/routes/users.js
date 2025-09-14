import express from "express";
import { User, Review } from "../models/index.js";
import { protect, ownerOrAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/error.js";
import {
  validateUserUpdate,
  validateObjectId,
} from "../middleware/validation.js";

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Get user's recent reviews (public info)
  const recentReviews = await Review.find({
    user: req.params.id,
    isActive: true,
  })
    .populate("movie", "title posterUrl releaseYear averageRating")
    .sort({ createdAt: -1 })
    .limit(5)
    .select("rating reviewText title createdAt movie isSpoiler");

  // Get user statistics
  const reviewStats = await Review.aggregate([
    { $match: { user: user._id, isActive: true } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: "$rating" },
        ratingDistribution: { $push: "$rating" },
      },
    },
  ]);

  let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let stats = {
    totalReviews: 0,
    averageRating: 0,
  };

  if (reviewStats.length > 0) {
    stats = {
      totalReviews: reviewStats[0].totalReviews,
      averageRating: Math.round(reviewStats[0].averageRating * 10) / 10,
    };

    reviewStats[0].ratingDistribution.forEach((rating) => {
      ratingDistribution[rating]++;
    });
  }

  res.json({
    success: true,
    data: {
      user: {
        _id: user._id,
        username: user.username,
        bio: user.bio,
        profilePicture: user.profilePicture,
        joinDate: user.joinDate,
        favoriteGenres: user.favoriteGenres,
        stats: {
          ...user.stats,
          ...stats,
          ratingDistribution,
        },
      },
      recentReviews,
    },
  });
});

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private (User or Admin only)
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const { username, email, bio, favoriteGenres, profilePicture } = req.body;

  // Check if username is being changed and is available
  if (username && username !== user.username) {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username is already taken",
      });
    }
  }

  // Check if email is being changed and is available
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }
  }

  // Update user
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      ...(username && { username }),
      ...(email && { email }),
      ...(bio !== undefined && { bio }),
      ...(favoriteGenres && { favoriteGenres }),
      ...(profilePicture !== undefined && { profilePicture }),
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: {
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        bio: updatedUser.bio,
        favoriteGenres: updatedUser.favoriteGenres,
        profilePicture: updatedUser.profilePicture,
        joinDate: updatedUser.joinDate,
        stats: updatedUser.stats,
        isAdmin: updatedUser.isAdmin,
      },
    },
  });
});

// @desc    Get user's reviews with pagination
// @route   GET /api/users/:id/reviews
// @access  Public
const getUserReviews = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    rating,
  } = req.query;

  // Check if user exists
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Build filters
  const filters = {
    user: req.params.id,
    ...(rating && { rating: Array.isArray(rating) ? rating : [rating] }),
    sortBy,
    sortOrder,
  };

  // Get reviews
  const reviews = await Review.getReviewsWithFilters(filters, {
    page: parseInt(page),
    limit: parseInt(limit),
  });

  // Get total count for pagination
  const query = { user: req.params.id, isActive: true };
  if (rating) {
    if (Array.isArray(rating)) {
      query.rating = { $in: rating.map((r) => parseInt(r)) };
    } else {
      query.rating = parseInt(rating);
    }
  }

  const totalReviews = await Review.countDocuments(query);
  const totalPages = Math.ceil(totalReviews / limit);

  res.json({
    success: true,
    data: {
      reviews,
      user: {
        _id: user._id,
        username: user.username,
        profilePicture: user.profilePicture,
      },
      pagination: {
        current: parseInt(page),
        pages: totalPages,
        total: totalReviews,
        limit: parseInt(limit),
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    },
  });
});

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Public
const getUserStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Get detailed review statistics
  const reviewStats = await Review.aggregate([
    { $match: { user: user._id, isActive: true } },
    {
      $lookup: {
        from: "movies",
        localField: "movie",
        foreignField: "_id",
        as: "movieDetails",
      },
    },
    { $unwind: "$movieDetails" },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: "$rating" },
        ratingDistribution: { $push: "$rating" },
        reviewedGenres: { $push: "$movieDetails.genre" },
        reviewedYears: { $push: "$movieDetails.releaseYear" },
        totalHelpfulVotes: { $sum: "$helpfulVotes" },
        totalVotes: { $sum: "$totalVotes" },
      },
    },
  ]);

  let stats = {
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    favoriteGenres: [],
    reviewsByDecade: {},
    helpfulnessRatio: 0,
    totalHelpfulVotes: 0,
  };

  if (reviewStats.length > 0) {
    const stat = reviewStats[0];

    // Basic stats
    stats.totalReviews = stat.totalReviews;
    stats.averageRating = Math.round(stat.averageRating * 10) / 10;
    stats.totalHelpfulVotes = stat.totalHelpfulVotes;

    // Helpfulness ratio
    if (stat.totalVotes > 0) {
      stats.helpfulnessRatio = Math.round(
        (stat.totalHelpfulVotes / stat.totalVotes) * 100
      );
    }

    // Rating distribution
    stat.ratingDistribution.forEach((rating) => {
      stats.ratingDistribution[rating]++;
    });

    // Favorite genres (top 5)
    const genreCount = {};
    stat.reviewedGenres.flat().forEach((genre) => {
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    });

    stats.favoriteGenres = Object.entries(genreCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([genre, count]) => ({ genre, count }));

    // Reviews by decade
    stat.reviewedYears.forEach((year) => {
      const decade = Math.floor(year / 10) * 10;
      const decadeLabel = `${decade}s`;
      stats.reviewsByDecade[decadeLabel] =
        (stats.reviewsByDecade[decadeLabel] || 0) + 1;
    });
  }

  res.json({
    success: true,
    data: {
      user: {
        _id: user._id,
        username: user.username,
        joinDate: user.joinDate,
      },
      stats,
    },
  });
});

// @desc    Delete user account
// @route   DELETE /api/users/:id
// @access  Private (User or Admin only)
const deleteUserAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Soft delete all user's reviews
  await Review.updateMany({ user: req.params.id }, { isActive: false });

  // Delete user
  await User.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: "Account deleted successfully",
  });
});

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin only)
const getAllUsers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
    search,
  } = req.query;

  // Build query
  let query = {};
  if (search) {
    query = {
      $or: [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };
  }

  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

  const users = await User.find(query)
    .select("-password")
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const totalUsers = await User.countDocuments(query);
  const totalPages = Math.ceil(totalUsers / limit);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        current: parseInt(page),
        pages: totalPages,
        total: totalUsers,
        limit: parseInt(limit),
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    },
  });
});

// Routes
router.get("/", protect, getAllUsers); // Admin only functionality would need to be added

router
  .route("/:id")
  .get(validateObjectId("id"), getUserProfile)
  .put(
    protect,
    ownerOrAdmin(),
    validateObjectId("id"),
    validateUserUpdate,
    updateUserProfile
  )
  .delete(protect, ownerOrAdmin(), validateObjectId("id"), deleteUserAccount);

router.get("/:id/reviews", validateObjectId("id"), getUserReviews);
router.get("/:id/stats", validateObjectId("id"), getUserStats);

export default router;
