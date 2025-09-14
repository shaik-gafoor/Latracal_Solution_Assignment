import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be between 1 and 5"],
      max: [5, "Rating must be between 1 and 5"],
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number",
      },
    },
    reviewText: {
      type: String,
      maxlength: [1000, "Review text cannot exceed 1000 characters"],
      trim: true,
    },
    title: {
      type: String,
      maxlength: [100, "Review title cannot exceed 100 characters"],
      trim: true,
    },
    isRecommended: {
      type: Boolean,
      default: function () {
        return this.rating >= 4;
      },
    },
    helpfulVotes: {
      type: Number,
      default: 0,
      min: [0, "Helpful votes cannot be negative"],
    },
    totalVotes: {
      type: Number,
      default: 0,
      min: [0, "Total votes cannot be negative"],
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    isSpoiler: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for helpfulness percentage
reviewSchema.virtual("helpfulnessRatio").get(function () {
  if (this.totalVotes === 0) return 0;
  return Math.round((this.helpfulVotes / this.totalVotes) * 100);
});

// Compound index to ensure one review per user per movie
reviewSchema.index({ user: 1, movie: 1 }, { unique: true });

// Other indexes for better query performance
reviewSchema.index({ movie: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ isActive: 1 });

// Pre-save middleware to update movie average rating
reviewSchema.post("save", async function (doc) {
  try {
    const Movie = mongoose.model("Movie");
    const movie = await Movie.findById(doc.movie);
    if (movie) {
      await movie.updateAverageRating();
    }

    // Update user stats
    const User = mongoose.model("User");
    const user = await User.findById(doc.user);
    if (user) {
      await user.updateStats();
    }
  } catch (error) {
    console.error("Error updating movie rating or user stats:", error);
  }
});

// Pre-remove middleware to update movie average rating when review is deleted
reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    try {
      const Movie = mongoose.model("Movie");
      const movie = await Movie.findById(doc.movie);
      if (movie) {
        await movie.updateAverageRating();
      }

      // Update user stats
      const User = mongoose.model("User");
      const user = await User.findById(doc.user);
      if (user) {
        await user.updateStats();
      }
    } catch (error) {
      console.error("Error updating movie rating or user stats:", error);
    }
  }
});

// Method to mark review as helpful
reviewSchema.methods.markHelpful = async function (isHelpful = true) {
  if (isHelpful) {
    this.helpfulVotes += 1;
  }
  this.totalVotes += 1;
  await this.save();
};

// Static method to get reviews with pagination and filters
reviewSchema.statics.getReviewsWithFilters = function (filters, options) {
  const {
    movie,
    user,
    rating,
    minHelpfulness,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = filters;

  const { page = 1, limit = 10 } = options;

  const query = { isActive: true };

  // Apply filters
  if (movie) query.movie = movie;
  if (user) query.user = user;
  if (rating) {
    if (Array.isArray(rating)) {
      query.rating = { $in: rating };
    } else {
      query.rating = rating;
    }
  }

  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

  return this.find(query)
    .populate("user", "username profilePicture joinDate")
    .populate("movie", "title posterUrl releaseYear")
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();
};

// Method to update review
reviewSchema.methods.updateReview = async function (updateData) {
  Object.assign(this, updateData);
  this.isEdited = true;
  this.editedAt = new Date();
  await this.save();

  // Update movie rating after edit
  const Movie = mongoose.model("Movie");
  const movie = await Movie.findById(this.movie);
  if (movie) {
    await movie.updateAverageRating();
  }
};

export default mongoose.model("Review", reviewSchema);
