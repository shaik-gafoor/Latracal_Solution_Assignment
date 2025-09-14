import mongoose from "mongoose";

const watchlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: [true, "Movie is required"],
    },
    dateAdded: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["want_to_watch", "watching", "watched", "on_hold", "dropped"],
      default: "want_to_watch",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
      trim: true,
    },
    watchedDate: {
      type: Date,
    },
    personalRating: {
      type: Number,
      min: [1, "Personal rating must be between 1 and 5"],
      max: [5, "Personal rating must be between 1 and 5"],
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [50, "Tag cannot exceed 50 characters"],
      },
    ],
    reminder: {
      enabled: {
        type: Boolean,
        default: false,
      },
      date: {
        type: Date,
      },
      notified: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index to ensure one entry per user per movie
watchlistSchema.index({ user: 1, movie: 1 }, { unique: true });

// Other indexes for better query performance
watchlistSchema.index({ user: 1, status: 1, dateAdded: -1 });
watchlistSchema.index({ user: 1, priority: 1 });
watchlistSchema.index({ user: 1, "reminder.enabled": 1, "reminder.date": 1 });

// Static method to get user's watchlist with filters
watchlistSchema.statics.getUserWatchlist = function (userId, filters, options) {
  const {
    status,
    priority,
    genre,
    sortBy = "dateAdded",
    sortOrder = "desc",
  } = filters;

  const { page = 1, limit = 20 } = options;

  const query = { user: userId };

  // Apply filters
  if (status) {
    if (Array.isArray(status)) {
      query.status = { $in: status };
    } else {
      query.status = status;
    }
  }
  if (priority) query.priority = priority;

  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

  let aggregationPipeline = [
    { $match: query },
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
      $match: {
        "movieDetails.isActive": true,
      },
    },
  ];

  // Add genre filter if specified
  if (genre) {
    aggregationPipeline.push({
      $match: {
        "movieDetails.genre": { $in: Array.isArray(genre) ? genre : [genre] },
      },
    });
  }

  // Add sorting
  aggregationPipeline.push({ $sort: sortOptions });

  // Add pagination
  aggregationPipeline.push({ $skip: (page - 1) * limit });
  aggregationPipeline.push({ $limit: limit * 1 });

  // Project fields
  aggregationPipeline.push({
    $project: {
      _id: 1,
      user: 1,
      movie: 1,
      dateAdded: 1,
      status: 1,
      priority: 1,
      notes: 1,
      watchedDate: 1,
      personalRating: 1,
      tags: 1,
      reminder: 1,
      createdAt: 1,
      updatedAt: 1,
      movieDetails: {
        _id: 1,
        title: 1,
        posterUrl: 1,
        genre: 1,
        releaseYear: 1,
        director: 1,
        duration: 1,
        averageRating: 1,
        totalReviews: 1,
      },
    },
  });

  return this.aggregate(aggregationPipeline);
};

// Method to update watchlist item
watchlistSchema.methods.updateWatchlistItem = async function (updateData) {
  Object.assign(this, updateData);

  // If status is changed to 'watched', set watchedDate
  if (updateData.status === "watched" && !this.watchedDate) {
    this.watchedDate = new Date();
  }

  // If status is changed from 'watched', remove watchedDate
  if (updateData.status && updateData.status !== "watched") {
    this.watchedDate = undefined;
  }

  await this.save();
};

// Static method to get watchlist statistics
watchlistSchema.statics.getWatchlistStats = async function (userId) {
  const stats = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
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
        totalMovies: { $sum: 1 },
        watchedMovies: {
          $sum: { $cond: [{ $eq: ["$status", "watched"] }, 1, 0] },
        },
        wantToWatch: {
          $sum: { $cond: [{ $eq: ["$status", "want_to_watch"] }, 1, 0] },
        },
        currentlyWatching: {
          $sum: { $cond: [{ $eq: ["$status", "watching"] }, 1, 0] },
        },
        onHold: {
          $sum: { $cond: [{ $eq: ["$status", "on_hold"] }, 1, 0] },
        },
        dropped: {
          $sum: { $cond: [{ $eq: ["$status", "dropped"] }, 1, 0] },
        },
        averagePersonalRating: {
          $avg: {
            $cond: [
              {
                $and: [
                  { $ne: ["$personalRating", null] },
                  { $ne: ["$personalRating", 0] },
                ],
              },
              "$personalRating",
              null,
            ],
          },
        },
        favoriteGenres: {
          $push: "$movieDetails.genre",
        },
        totalWatchTime: {
          $sum: {
            $cond: [
              { $eq: ["$status", "watched"] },
              "$movieDetails.duration",
              0,
            ],
          },
        },
      },
    },
  ]);

  if (stats.length === 0) {
    return {
      totalMovies: 0,
      watchedMovies: 0,
      wantToWatch: 0,
      currentlyWatching: 0,
      onHold: 0,
      dropped: 0,
      averagePersonalRating: 0,
      favoriteGenres: [],
      totalWatchTime: 0,
    };
  }

  const stat = stats[0];

  // Process favorite genres
  const genreCount = {};
  stat.favoriteGenres.flat().forEach((genre) => {
    genreCount[genre] = (genreCount[genre] || 0) + 1;
  });

  const favoriteGenres = Object.entries(genreCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([genre]) => genre);

  return {
    ...stat,
    favoriteGenres,
    averagePersonalRating: stat.averagePersonalRating
      ? Math.round(stat.averagePersonalRating * 10) / 10
      : 0,
  };
};

export default mongoose.model("Watchlist", watchlistSchema);
