import { body, param, query, validationResult } from "express-validator";

// Validation result middleware
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation errors",
      errors: errors.array().map((error) => ({
        field: error.param,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  next();
};

// User validation rules
export const validateUserRegistration = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),

  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),

  handleValidationErrors,
];

export const validateUserLogin = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),

  handleValidationErrors,
];

export const validateUserUpdate = [
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(
      "Username can only contain letters, numbers, underscores, and hyphens"
    ),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("bio")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio cannot exceed 500 characters"),

  body("favoriteGenres")
    .optional()
    .isArray()
    .withMessage("Favorite genres must be an array"),

  body("favoriteGenres.*")
    .optional()
    .isIn([
      "Action",
      "Adventure",
      "Comedy",
      "Crime",
      "Drama",
      "Fantasy",
      "Horror",
      "Mystery",
      "Romance",
      "Sci-Fi",
      "Thriller",
      "Western",
      "Animation",
      "Documentary",
      "Family",
      "Music",
      "War",
    ])
    .withMessage("Invalid genre"),

  handleValidationErrors,
];

// Movie validation rules
export const validateMovieCreation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Movie title is required")
    .isLength({ max: 200 })
    .withMessage("Title cannot exceed 200 characters"),

  body("genre")
    .isArray({ min: 1 })
    .withMessage("At least one genre is required"),

  body("genre.*")
    .isIn([
      "Action",
      "Adventure",
      "Comedy",
      "Crime",
      "Drama",
      "Fantasy",
      "Horror",
      "Mystery",
      "Romance",
      "Sci-Fi",
      "Thriller",
      "Western",
      "Animation",
      "Documentary",
      "Family",
      "Music",
      "War",
    ])
    .withMessage("Invalid genre"),

  body("releaseYear")
    .isInt({ min: 1888, max: new Date().getFullYear() + 2 })
    .withMessage("Invalid release year"),

  body("director")
    .trim()
    .notEmpty()
    .withMessage("Director is required")
    .isLength({ max: 100 })
    .withMessage("Director name cannot exceed 100 characters"),

  body("synopsis")
    .trim()
    .notEmpty()
    .withMessage("Synopsis is required")
    .isLength({ max: 2000 })
    .withMessage("Synopsis cannot exceed 2000 characters"),

  body("posterUrl")
    .isURL()
    .withMessage("Please provide a valid poster URL")
    .matches(/\.(jpg|jpeg|png|webp|gif)$/i)
    .withMessage("Poster URL must be a valid image"),

  body("trailerUrl")
    .optional()
    .isURL()
    .withMessage("Please provide a valid trailer URL"),

  body("duration")
    .isInt({ min: 1 })
    .withMessage("Duration must be at least 1 minute"),

  body("language").trim().notEmpty().withMessage("Language is required"),

  body("country").trim().notEmpty().withMessage("Country is required"),

  body("budget")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Budget must be a positive number"),

  body("boxOffice")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Box office must be a positive number"),

  handleValidationErrors,
];

// Review validation rules
export const validateReviewCreation = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  body("reviewText")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Review text cannot exceed 1000 characters"),

  body("title")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Review title cannot exceed 100 characters"),

  body("isSpoiler")
    .optional()
    .isBoolean()
    .withMessage("isSpoiler must be a boolean"),

  handleValidationErrors,
];

// Watchlist validation rules
export const validateWatchlistItem = [
  body("status")
    .optional()
    .isIn(["want_to_watch", "watching", "watched", "on_hold", "dropped"])
    .withMessage("Invalid status"),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid priority"),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Notes cannot exceed 500 characters"),

  body("personalRating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Personal rating must be between 1 and 5"),

  body("tags").optional().isArray().withMessage("Tags must be an array"),

  body("tags.*")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Each tag cannot exceed 50 characters"),

  handleValidationErrors,
];

// Parameter validation
export const validateObjectId = (paramName = "id") => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName}`),

  handleValidationErrors,
];

// Query validation for pagination and filtering
export const validateMovieQuery = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("genre")
    .optional()
    .custom((value) => {
      const genres = Array.isArray(value) ? value : [value];
      const validGenres = [
        "Action",
        "Adventure",
        "Comedy",
        "Crime",
        "Drama",
        "Fantasy",
        "Horror",
        "Mystery",
        "Romance",
        "Sci-Fi",
        "Thriller",
        "Western",
        "Animation",
        "Documentary",
        "Family",
        "Music",
        "War",
      ];
      return genres.every((genre) => validGenres.includes(genre));
    })
    .withMessage("Invalid genre"),

  query("releaseYear")
    .optional()
    .isInt({ min: 1888, max: new Date().getFullYear() + 2 })
    .withMessage("Invalid release year"),

  query("minRating")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("Min rating must be between 0 and 5"),

  query("maxRating")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("Max rating must be between 0 and 5"),

  query("sortBy")
    .optional()
    .isIn([
      "title",
      "releaseYear",
      "averageRating",
      "totalReviews",
      "createdAt",
    ])
    .withMessage("Invalid sort field"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be asc or desc"),

  handleValidationErrors,
];
