import express from "express";
import { Movie } from "../models/index.js";
import { protect, adminOnly, optionalAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/error.js";
import {
  validateMovieCreation,
  validateObjectId,
  validateMovieQuery,
} from "../middleware/validation.js";

const router = express.Router();

// @desc    Get all movies with filtering and pagination
// @route   GET /api/movies
// @access  Public
const getAllMovies = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    genre,
    releaseYear,
    director,
    minRating,
    maxRating,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  // Build filters
  const filters = {};
  if (genre) filters.genre = genre;
  if (releaseYear) filters.releaseYear = releaseYear;
  if (director) filters.director = director;
  if (minRating) filters.minRating = parseFloat(minRating);
  if (maxRating) filters.maxRating = parseFloat(maxRating);
  if (search) filters.search = search;
  filters.sortBy = sortBy;
  filters.sortOrder = sortOrder;

  // Get movies with filters
  const movies = await Movie.getMoviesWithFilters(filters, {
    page: parseInt(page),
    limit: parseInt(limit),
  });

  // Get total count for pagination
  const query = { isActive: true };
  if (genre) query.genre = { $in: Array.isArray(genre) ? genre : [genre] };
  if (releaseYear) query.releaseYear = releaseYear;
  if (director) query.director = { $regex: director, $options: "i" };
  if (minRating)
    query.averageRating = {
      ...query.averageRating,
      $gte: parseFloat(minRating),
    };
  if (maxRating)
    query.averageRating = {
      ...query.averageRating,
      $lte: parseFloat(maxRating),
    };
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { director: { $regex: search, $options: "i" } },
      { "cast.name": { $regex: search, $options: "i" } },
      { genre: { $regex: search, $options: "i" } },
    ];
  }

  const totalMovies = await Movie.countDocuments(query);
  const totalPages = Math.ceil(totalMovies / limit);

  res.json({
    success: true,
    data: {
      movies,
      pagination: {
        current: parseInt(page),
        pages: totalPages,
        total: totalMovies,
        limit: parseInt(limit),
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    },
  });
});

// @desc    Get single movie by ID
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = asyncHandler(async (req, res) => {
  const movie = await Movie.findOne({
    _id: req.params.id,
    isActive: true,
  }).populate("addedBy", "username");

  if (!movie) {
    return res.status(404).json({
      success: false,
      message: "Movie not found",
    });
  }

  res.json({
    success: true,
    data: {
      movie,
    },
  });
});

// @desc    Create new movie
// @route   POST /api/movies
// @access  Private (Admin only)
const createMovie = asyncHandler(async (req, res) => {
  const movieData = {
    ...req.body,
    addedBy: req.user._id,
  };

  // Check if movie with same title and release year already exists
  const existingMovie = await Movie.findOne({
    title: { $regex: new RegExp(`^${movieData.title}$`, "i") },
    releaseYear: movieData.releaseYear,
    isActive: true,
  });

  if (existingMovie) {
    return res.status(400).json({
      success: false,
      message: "A movie with this title and release year already exists",
    });
  }

  const movie = await Movie.create(movieData);

  await movie.populate("addedBy", "username");

  res.status(201).json({
    success: true,
    message: "Movie created successfully",
    data: {
      movie,
    },
  });
});

// @desc    Update movie
// @route   PUT /api/movies/:id
// @access  Private (Admin only)
const updateMovie = asyncHandler(async (req, res) => {
  let movie = await Movie.findOne({ _id: req.params.id, isActive: true });

  if (!movie) {
    return res.status(404).json({
      success: false,
      message: "Movie not found",
    });
  }

  // Check for duplicate title/year if title or year is being updated
  if (req.body.title || req.body.releaseYear) {
    const title = req.body.title || movie.title;
    const releaseYear = req.body.releaseYear || movie.releaseYear;

    const existingMovie = await Movie.findOne({
      _id: { $ne: movie._id },
      title: { $regex: new RegExp(`^${title}$`, "i") },
      releaseYear,
      isActive: true,
    });

    if (existingMovie) {
      return res.status(400).json({
        success: false,
        message: "A movie with this title and release year already exists",
      });
    }
  }

  movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate("addedBy", "username");

  res.json({
    success: true,
    message: "Movie updated successfully",
    data: {
      movie,
    },
  });
});

// @desc    Delete movie (soft delete)
// @route   DELETE /api/movies/:id
// @access  Private (Admin only)
const deleteMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findOne({ _id: req.params.id, isActive: true });

  if (!movie) {
    return res.status(404).json({
      success: false,
      message: "Movie not found",
    });
  }

  movie.isActive = false;
  await movie.save();

  res.json({
    success: true,
    message: "Movie deleted successfully",
  });
});

// @desc    Get movie statistics
// @route   GET /api/movies/stats
// @access  Public
const getMovieStats = asyncHandler(async (req, res) => {
  const stats = await Movie.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalMovies: { $sum: 1 },
        averageRating: { $avg: "$averageRating" },
        totalReviews: { $sum: "$totalReviews" },
        genreDistribution: { $push: "$genre" },
        yearRange: {
          $push: {
            min: { $min: "$releaseYear" },
            max: { $max: "$releaseYear" },
          },
        },
      },
    },
  ]);

  // Process genre distribution
  let genreCount = {};
  if (stats.length > 0) {
    stats[0].genreDistribution.flat().forEach((genre) => {
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    });
  }

  // Get top rated movies
  const topRatedMovies = await Movie.find({ isActive: true })
    .sort({ averageRating: -1, totalReviews: -1 })
    .limit(5)
    .select("title posterUrl averageRating totalReviews releaseYear");

  // Get most reviewed movies
  const mostReviewedMovies = await Movie.find({ isActive: true })
    .sort({ totalReviews: -1, averageRating: -1 })
    .limit(5)
    .select("title posterUrl averageRating totalReviews releaseYear");

  // Get recent movies
  const recentMovies = await Movie.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("title posterUrl averageRating totalReviews releaseYear createdAt");

  res.json({
    success: true,
    data: {
      overview: stats[0] || {
        totalMovies: 0,
        averageRating: 0,
        totalReviews: 0,
      },
      genreDistribution: genreCount,
      topRatedMovies,
      mostReviewedMovies,
      recentMovies,
    },
  });
});

// @desc    Search movies
// @route   GET /api/movies/search
// @access  Public
const searchMovies = asyncHandler(async (req, res) => {
  const { q, limit = 10 } = req.query;

  if (!q || q.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Search query is required",
    });
  }

  const searchQuery = q.trim();

  const movies = await Movie.find({
    isActive: true,
    $or: [
      { title: { $regex: searchQuery, $options: "i" } },
      { director: { $regex: searchQuery, $options: "i" } },
      { "cast.name": { $regex: searchQuery, $options: "i" } },
      { genre: { $regex: searchQuery, $options: "i" } },
    ],
  })
    .select(
      "title posterUrl averageRating totalReviews releaseYear director genre"
    )
    .sort({ averageRating: -1, totalReviews: -1 })
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: {
      movies,
      query: searchQuery,
      total: movies.length,
    },
  });
});

// Routes
router
  .route("/")
  .get(validateMovieQuery, getAllMovies)
  .post(protect, adminOnly, validateMovieCreation, createMovie);

router.get("/stats", getMovieStats);
router.get("/search", searchMovies);

router
  .route("/:id")
  .get(validateObjectId("id"), getMovieById)
  .put(protect, adminOnly, validateObjectId("id"), updateMovie)
  .delete(protect, adminOnly, validateObjectId("id"), deleteMovie);

export default router;
