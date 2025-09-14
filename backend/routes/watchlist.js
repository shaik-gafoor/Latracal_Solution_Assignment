import express from "express";
import { Watchlist, Movie } from "../models/index.js";
import { protect, ownerOrAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/error.js";
import {
  validateWatchlistItem,
  validateObjectId,
} from "../middleware/validation.js";

const router = express.Router();

// @desc    Get user's watchlist
// @route   GET /api/users/:userId/watchlist
// @access  Private (User or Admin only)
const getUserWatchlist = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    priority,
    genre,
    sortBy = "dateAdded",
    sortOrder = "desc",
  } = req.query;

  // Check if user exists (this is handled by the ownerOrAdmin middleware)

  // Build filters
  const filters = {};
  if (status) filters.status = status;
  if (priority) filters.priority = priority;
  if (genre) filters.genre = genre;
  filters.sortBy = sortBy;
  filters.sortOrder = sortOrder;

  // Get watchlist items
  const watchlistItems = await Watchlist.getUserWatchlist(
    req.params.userId,
    filters,
    {
      page: parseInt(page),
      limit: parseInt(limit),
    }
  );

  // Get total count for pagination
  const query = { user: req.params.userId };
  if (status) {
    if (Array.isArray(status)) {
      query.status = { $in: status };
    } else {
      query.status = status;
    }
  }
  if (priority) query.priority = priority;

  const totalItems = await Watchlist.countDocuments(query);
  const totalPages = Math.ceil(totalItems / limit);

  // Get watchlist statistics
  const stats = await Watchlist.getWatchlistStats(req.params.userId);

  res.json({
    success: true,
    data: {
      watchlist: watchlistItems,
      statistics: stats,
      pagination: {
        current: parseInt(page),
        pages: totalPages,
        total: totalItems,
        limit: parseInt(limit),
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    },
  });
});

// @desc    Add movie to watchlist
// @route   POST /api/users/:userId/watchlist
// @access  Private (User or Admin only)
const addToWatchlist = asyncHandler(async (req, res) => {
  const {
    movieId,
    status = "want_to_watch",
    priority = "medium",
    notes,
    tags,
  } = req.body;

  if (!movieId) {
    return res.status(400).json({
      success: false,
      message: "Movie ID is required",
    });
  }

  // Check if movie exists
  const movie = await Movie.findOne({ _id: movieId, isActive: true });
  if (!movie) {
    return res.status(404).json({
      success: false,
      message: "Movie not found",
    });
  }

  // Check if movie is already in user's watchlist
  const existingItem = await Watchlist.findOne({
    user: req.params.userId,
    movie: movieId,
  });

  if (existingItem) {
    return res.status(400).json({
      success: false,
      message: "Movie is already in your watchlist",
    });
  }

  // Create watchlist item
  const watchlistItem = await Watchlist.create({
    user: req.params.userId,
    movie: movieId,
    status,
    priority,
    notes: notes || "",
    tags: tags || [],
  });

  // Populate movie details
  await watchlistItem.populate(
    "movie",
    "title posterUrl genre releaseYear director duration averageRating totalReviews"
  );

  res.status(201).json({
    success: true,
    message: "Movie added to watchlist successfully",
    data: {
      watchlistItem,
    },
  });
});

// @desc    Get single watchlist item
// @route   GET /api/users/:userId/watchlist/:movieId
// @access  Private (User or Admin only)
const getWatchlistItem = asyncHandler(async (req, res) => {
  const watchlistItem = await Watchlist.findOne({
    user: req.params.userId,
    movie: req.params.movieId,
  }).populate(
    "movie",
    "title posterUrl genre releaseYear director duration averageRating totalReviews"
  );

  if (!watchlistItem) {
    return res.status(404).json({
      success: false,
      message: "Movie not found in watchlist",
    });
  }

  res.json({
    success: true,
    data: {
      watchlistItem,
    },
  });
});

// @desc    Update watchlist item
// @route   PUT /api/users/:userId/watchlist/:movieId
// @access  Private (User or Admin only)
const updateWatchlistItem = asyncHandler(async (req, res) => {
  const watchlistItem = await Watchlist.findOne({
    user: req.params.userId,
    movie: req.params.movieId,
  });

  if (!watchlistItem) {
    return res.status(404).json({
      success: false,
      message: "Movie not found in watchlist",
    });
  }

  // Update the item
  await watchlistItem.updateWatchlistItem(req.body);

  // Populate movie details
  await watchlistItem.populate(
    "movie",
    "title posterUrl genre releaseYear director duration averageRating totalReviews"
  );

  res.json({
    success: true,
    message: "Watchlist item updated successfully",
    data: {
      watchlistItem,
    },
  });
});

// @desc    Remove movie from watchlist
// @route   DELETE /api/users/:userId/watchlist/:movieId
// @access  Private (User or Admin only)
const removeFromWatchlist = asyncHandler(async (req, res) => {
  const watchlistItem = await Watchlist.findOne({
    user: req.params.userId,
    movie: req.params.movieId,
  });

  if (!watchlistItem) {
    return res.status(404).json({
      success: false,
      message: "Movie not found in watchlist",
    });
  }

  await Watchlist.findOneAndDelete({
    user: req.params.userId,
    movie: req.params.movieId,
  });

  res.json({
    success: true,
    message: "Movie removed from watchlist successfully",
  });
});

// @desc    Get watchlist statistics
// @route   GET /api/users/:userId/watchlist/stats
// @access  Private (User or Admin only)
const getWatchlistStats = asyncHandler(async (req, res) => {
  const stats = await Watchlist.getWatchlistStats(req.params.userId);

  res.json({
    success: true,
    data: {
      statistics: stats,
    },
  });
});

// @desc    Check if movie is in user's watchlist
// @route   GET /api/users/:userId/watchlist/check/:movieId
// @access  Private (User or Admin only)
const checkMovieInWatchlist = asyncHandler(async (req, res) => {
  const watchlistItem = await Watchlist.findOne({
    user: req.params.userId,
    movie: req.params.movieId,
  });

  res.json({
    success: true,
    data: {
      inWatchlist: !!watchlistItem,
      item: watchlistItem
        ? {
            status: watchlistItem.status,
            priority: watchlistItem.priority,
            dateAdded: watchlistItem.dateAdded,
          }
        : null,
    },
  });
});

// @desc    Bulk update watchlist items
// @route   PATCH /api/users/:userId/watchlist/bulk
// @access  Private (User or Admin only)
const bulkUpdateWatchlist = asyncHandler(async (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Items array is required",
    });
  }

  const updatePromises = items.map(async ({ movieId, ...updateData }) => {
    const watchlistItem = await Watchlist.findOne({
      user: req.params.userId,
      movie: movieId,
    });

    if (watchlistItem) {
      await watchlistItem.updateWatchlistItem(updateData);
      return watchlistItem;
    }
    return null;
  });

  const updatedItems = await Promise.all(updatePromises);
  const successfulUpdates = updatedItems.filter((item) => item !== null);

  res.json({
    success: true,
    message: `Successfully updated ${successfulUpdates.length} items`,
    data: {
      updatedCount: successfulUpdates.length,
      totalRequested: items.length,
    },
  });
});

// @desc    Get recommendations based on watchlist
// @route   GET /api/users/:userId/watchlist/recommendations
// @access  Private (User or Admin only)
const getWatchlistRecommendations = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  // Get user's watchlist to analyze preferences
  const watchlistItems = await Watchlist.find({
    user: req.params.userId,
  }).populate("movie", "genre director averageRating");

  if (watchlistItems.length === 0) {
    return res.json({
      success: true,
      message:
        "Add movies to your watchlist to get personalized recommendations",
      data: {
        recommendations: [],
      },
    });
  }

  // Analyze user preferences
  const genreCount = {};
  const directorCount = {};
  let totalRatingPreference = 0;

  watchlistItems.forEach((item) => {
    if (item.movie) {
      // Count genres
      item.movie.genre.forEach((genre) => {
        genreCount[genre] = (genreCount[genre] || 0) + 1;
      });

      // Count directors
      directorCount[item.movie.director] =
        (directorCount[item.movie.director] || 0) + 1;

      // Rating preference
      totalRatingPreference += item.movie.averageRating;
    }
  });

  const avgRatingPreference = totalRatingPreference / watchlistItems.length;
  const topGenres = Object.entries(genreCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([genre]) => genre);

  const topDirectors = Object.entries(directorCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([director]) => director);

  // Get movie IDs already in watchlist
  const watchlistMovieIds = watchlistItems.map((item) => item.movie._id);

  // Find recommendations
  const recommendations = await Movie.find({
    isActive: true,
    _id: { $nin: watchlistMovieIds },
    $or: [
      { genre: { $in: topGenres } },
      { director: { $in: topDirectors } },
      { averageRating: { $gte: avgRatingPreference - 0.5 } },
    ],
  })
    .sort({ averageRating: -1, totalReviews: -1 })
    .limit(parseInt(limit))
    .select(
      "title posterUrl genre director releaseYear averageRating totalReviews synopsis"
    );

  res.json({
    success: true,
    data: {
      recommendations,
      basedOn: {
        favoriteGenres: topGenres,
        favoriteDirectors: topDirectors,
        averageRatingPreference: Math.round(avgRatingPreference * 10) / 10,
      },
    },
  });
});

// Routes
router
  .route("/")
  .get(protect, ownerOrAdmin(), getUserWatchlist)
  .post(protect, ownerOrAdmin(), addToWatchlist);

router.get("/stats", protect, ownerOrAdmin(), getWatchlistStats);
router.get(
  "/recommendations",
  protect,
  ownerOrAdmin(),
  getWatchlistRecommendations
);
router.patch(
  "/bulk",
  protect,
  ownerOrAdmin(),
  validateWatchlistItem,
  bulkUpdateWatchlist
);

router.get(
  "/check/:movieId",
  protect,
  ownerOrAdmin(),
  validateObjectId("movieId"),
  checkMovieInWatchlist
);

router
  .route("/:movieId")
  .get(protect, ownerOrAdmin(), validateObjectId("movieId"), getWatchlistItem)
  .put(
    protect,
    ownerOrAdmin(),
    validateObjectId("movieId"),
    validateWatchlistItem,
    updateWatchlistItem
  )
  .delete(
    protect,
    ownerOrAdmin(),
    validateObjectId("movieId"),
    removeFromWatchlist
  );

export default router;
