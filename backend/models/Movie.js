import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Movie title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    genre: [
      {
        type: String,
        required: [true, "At least one genre is required"],
        enum: [
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
        ],
      },
    ],
    releaseYear: {
      type: Number,
      required: [true, "Release year is required"],
      min: [1888, "Release year must be after 1888"],
      max: [
        new Date().getFullYear() + 2,
        "Release year cannot be more than 2 years in the future",
      ],
    },
    director: {
      type: String,
      required: [true, "Director is required"],
      trim: true,
      maxlength: [100, "Director name cannot exceed 100 characters"],
    },
    cast: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        role: {
          type: String,
          trim: true,
        },
      },
    ],
    synopsis: {
      type: String,
      required: [true, "Synopsis is required"],
      maxlength: [2000, "Synopsis cannot exceed 2000 characters"],
    },
    posterUrl: {
      type: String,
      required: [true, "Poster URL is required"],
      match: [
        /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i,
        "Please provide a valid image URL",
      ],
    },
    trailerUrl: {
      type: String,
      match: [
        /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/,
        "Please provide a valid YouTube URL",
      ],
    },
    duration: {
      type: Number, // Duration in minutes
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 minute"],
    },
    language: {
      type: String,
      required: [true, "Language is required"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    budget: {
      type: Number, // Budget in USD
      min: [0, "Budget cannot be negative"],
    },
    boxOffice: {
      type: Number, // Box office earnings in USD
      min: [0, "Box office cannot be negative"],
    },
    rating: {
      imdbRating: {
        type: Number,
        min: [0, "IMDB rating must be between 0 and 10"],
        max: [10, "IMDB rating must be between 0 and 10"],
      },
      rottenTomatoesRating: {
        type: Number,
        min: [0, "Rotten Tomatoes rating must be between 0 and 100"],
        max: [100, "Rotten Tomatoes rating must be between 0 and 100"],
      },
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, "Average rating must be between 0 and 5"],
      max: [5, "Average rating must be between 0 and 5"],
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: [0, "Total reviews cannot be negative"],
    },
    ratingDistribution: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for movie reviews
movieSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "movie",
});

// Method to calculate and update average rating
movieSchema.methods.updateAverageRating = async function () {
  const Review = mongoose.model("Review");
  const stats = await Review.aggregate([
    {
      $match: { movie: this._id },
    },
    {
      $group: {
        _id: "$movie",
        avgRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
        ratings: { $push: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    const stat = stats[0];
    this.averageRating = Math.round(stat.avgRating * 10) / 10;
    this.totalReviews = stat.totalReviews;

    // Update rating distribution
    this.ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    stat.ratings.forEach((rating) => {
      this.ratingDistribution[rating]++;
    });
  } else {
    this.averageRating = 0;
    this.totalReviews = 0;
    this.ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  }

  await this.save();
};

// Static method to get movies with filters
movieSchema.statics.getMoviesWithFilters = function (filters, options) {
  const {
    genre,
    releaseYear,
    director,
    minRating,
    maxRating,
    search,
    sortBy = "title",
    sortOrder = "asc",
  } = filters;

  const { page = 1, limit = 10 } = options;

  const query = { isActive: true };

  // Apply filters
  if (genre) query.genre = { $in: Array.isArray(genre) ? genre : [genre] };
  if (releaseYear) {
    if (typeof releaseYear === "object") {
      if (releaseYear.min)
        query.releaseYear = { ...query.releaseYear, $gte: releaseYear.min };
      if (releaseYear.max)
        query.releaseYear = { ...query.releaseYear, $lte: releaseYear.max };
    } else {
      query.releaseYear = releaseYear;
    }
  }
  if (director) query.director = { $regex: director, $options: "i" };
  if (minRating)
    query.averageRating = { ...query.averageRating, $gte: minRating };
  if (maxRating)
    query.averageRating = { ...query.averageRating, $lte: maxRating };
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { director: { $regex: search, $options: "i" } },
      { "cast.name": { $regex: search, $options: "i" } },
      { genre: { $regex: search, $options: "i" } },
    ];
  }

  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

  return this.find(query)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate("addedBy", "username")
    .exec();
};

// Indexes for better query performance
movieSchema.index({ title: "text", director: "text", "cast.name": "text" });
movieSchema.index({ genre: 1 });
movieSchema.index({ releaseYear: 1 });
movieSchema.index({ averageRating: -1 });
movieSchema.index({ createdAt: -1 });
movieSchema.index({ isActive: 1 });

export default mongoose.model("Movie", movieSchema);
