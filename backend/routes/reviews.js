import express from "express";
import { Review, Movie } from "../models/index.js";
import { protect, optionalAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/error.js";
import {
  validateReviewCreation,
  validateObjectId,
} from "../middleware/validation.js";

const router = express.Router({ mergeParams: true });

// @desc    Get all reviews for a movie
// @route   GET /api/movies/:movieId/reviews
// @access  Public
const getMovieReviews = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    rating,
  } = req.query;

  // Check if movie exists
  const movie = await Movie.findOne({
    _id: req.params.movieId,
    isActive: true,
  });

  if (!movie) {
    return res.status(404).json({
      success: false,
      message: "Movie not found",
    });
  }

  // Build filters
  const filters = {
    movie: req.params.movieId,
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
  const query = { movie: req.params.movieId, isActive: true };
  if (rating) {
    if (Array.isArray(rating)) {
      query.rating = { $in: rating.map((r) => parseInt(r)) };
    } else {
      query.rating = parseInt(rating);
    }
  }

  const totalReviews = await Review.countDocuments(query);
  const totalPages = Math.ceil(totalReviews / limit);

  // Get review statistics
  const reviewStats = await Review.aggregate([
    { $match: { movie: movie._id, isActive: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: "$rating",
        },
      },
    },
  ]);

  let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  if (reviewStats.length > 0) {
    reviewStats[0].ratingDistribution.forEach((rating) => {
      ratingDistribution[rating]++;
    });
  }

  res.json({
    success: true,
    data: {
      reviews,
      movieInfo: {
        _id: movie._id,
        title: movie.title,
        posterUrl: movie.posterUrl,
        averageRating: movie.averageRating,
        totalReviews: movie.totalReviews,
      },
      statistics: {
        averageRating: reviewStats[0]?.averageRating || 0,
        totalReviews: reviewStats[0]?.totalReviews || 0,
        ratingDistribution,
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

// @desc    Get single review
// @route   GET /api/movies/:movieId/reviews/:reviewId
// @access  Public
const getReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({
    _id: req.params.reviewId,
    movie: req.params.movieId,
    isActive: true,
  })
    .populate("user", "username profilePicture joinDate stats")
    .populate("movie", "title posterUrl releaseYear");

  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Review not found",
    });
  }

  res.json({
    success: true,
    data: {
      review,
    },
  });
});

// @desc    Create new review for a movie
// @route   POST /api/movies/:movieId/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { rating, reviewText, title, isSpoiler } = req.body;

  // Check if movie exists
  const movie = await Movie.findOne({
    _id: req.params.movieId,
    isActive: true,
  });

  if (!movie) {
    return res.status(404).json({
      success: false,
      message: "Movie not found",
    });
  }

  // Check if user already reviewed this movie
  const existingReview = await Review.findOne({
    user: req.user._id,
    movie: req.params.movieId,
    isActive: true,
  });

  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: "You have already reviewed this movie",
    });
  }

  // Create review
  const review = await Review.create({
    user: req.user._id,
    movie: req.params.movieId,
    rating,
    reviewText: reviewText || "",
    title: title || "",
    isSpoiler: isSpoiler || false,
  });

  await review.populate("user", "username profilePicture joinDate stats");

  res.status(201).json({
    success: true,
    message: "Review created successfully",
    data: {
      review,
    },
  });
});

// @desc    Update review
// @route   PUT /api/movies/:movieId/reviews/:reviewId
// @access  Private (Review owner only)
const updateReview = asyncHandler(async (req, res) => {
  let review = await Review.findOne({
    _id: req.params.reviewId,
    movie: req.params.movieId,
    isActive: true,
  });

  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Review not found",
    });
  }

  // Check if user owns the review or is admin
  if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to update this review",
    });
  }

  // Update review
  await review.updateReview(req.body);

  await review.populate("user", "username profilePicture joinDate stats");

  res.json({
    success: true,
    message: "Review updated successfully",
    data: {
      review,
    },
  });
});

// @desc    Delete review
// @route   DELETE /api/movies/:movieId/reviews/:reviewId
// @access  Private (Review owner or admin only)
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({
    _id: req.params.reviewId,
    movie: req.params.movieId,
    isActive: true,
  });

  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Review not found",
    });
  }

  // Check if user owns the review or is admin
  if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to delete this review",
    });
  }

  // Soft delete
  review.isActive = false;
  await review.save();

  res.json({
    success: true,
    message: "Review deleted successfully",
  });
});

// @desc    Mark review as helpful
// @route   POST /api/movies/:movieId/reviews/:reviewId/helpful
// @access  Private
const markReviewHelpful = asyncHandler(async (req, res) => {
  const { isHelpful = true } = req.body;

  const review = await Review.findOne({
    _id: req.params.reviewId,
    movie: req.params.movieId,
    isActive: true,
  });

  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Review not found",
    });
  }

  // Users cannot mark their own reviews as helpful
  if (review.user.toString() === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: "You cannot mark your own review as helpful",
    });
  }

  await review.markHelpful(isHelpful);

  res.json({
    success: true,
    message: `Review marked as ${isHelpful ? "helpful" : "not helpful"}`,
    data: {
      helpfulVotes: review.helpfulVotes,
      totalVotes: review.totalVotes,
      helpfulnessRatio: review.helpfulnessRatio,
    },
  });
});

// @desc    Get user's review for a movie
// @route   GET /api/movies/:movieId/reviews/my-review
// @access  Private
const getMyReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({
    user: req.user._id,
    movie: req.params.movieId,
    isActive: true,
  }).populate("movie", "title posterUrl releaseYear");

  if (!review) {
    return res.status(404).json({
      success: false,
      message: "You have not reviewed this movie",
    });
  }

  res.json({
    success: true,
    data: {
      review,
    },
  });
});

// Routes
router
  .route("/")
  .get(validateObjectId("movieId"), getMovieReviews)
  .post(
    protect,
    validateObjectId("movieId"),
    validateReviewCreation,
    createReview
  );

router.get("/my-review", protect, validateObjectId("movieId"), getMyReview);

router
  .route("/:reviewId")
  .get(validateObjectId("movieId"), validateObjectId("reviewId"), getReview)
  .put(
    protect,
    validateObjectId("movieId"),
    validateObjectId("reviewId"),
    updateReview
  )
  .delete(
    protect,
    validateObjectId("movieId"),
    validateObjectId("reviewId"),
    deleteReview
  );

router.post(
  "/:reviewId/helpful",
  protect,
  validateObjectId("movieId"),
  validateObjectId("reviewId"),
  markReviewHelpful
);

export default router;
