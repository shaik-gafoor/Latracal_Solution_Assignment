import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import StarRating from "../components/StarRating";
import MoviePoster from "../components/MoviePoster";
import { useAppContext } from "../context/AppContext";
import moviesData from "../assets/movies.json";

const MovieDetails = () => {
  const { id } = useParams();
  const { actions } = useAppContext();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Load user reviews from localStorage
  useEffect(() => {
    const savedReviews = localStorage.getItem(`reviews_${id}`);
    if (savedReviews) {
      const userReviews = JSON.parse(savedReviews);
      setReviews(userReviews);
    }
  }, [id]);

  // Load movie data from JSON based on ID
  useEffect(() => {
    setTimeout(() => {
      // Find the movie with the matching imdbID
      const foundMovie = moviesData.find((m) => m.imdbID === id);

      if (foundMovie) {
        const processedMovie = {
          id: foundMovie.imdbID,
          title: foundMovie.Title,
          genre: foundMovie.Genre,
          year: parseInt(foundMovie.Year),
          rating:
            foundMovie.imdbRating && foundMovie.imdbRating !== "N/A"
              ? parseFloat(foundMovie.imdbRating) / 2
              : 0,
          director: foundMovie.Director,
          cast: foundMovie.Actors ? foundMovie.Actors.split(", ") : [],
          duration: foundMovie.Runtime,
          poster: foundMovie.Poster,
          backdrop:
            foundMovie.Images && foundMovie.Images.length > 0
              ? foundMovie.Images[0]
              : null,
          description: foundMovie.Plot,
          budget: "N/A",
          boxOffice: "N/A",
          language: foundMovie.Language,
          country: foundMovie.Country,
          rated: foundMovie.Rated,
          type: foundMovie.Type,
          comingSoon: foundMovie.ComingSoon || false,
          awards: foundMovie.Awards,
          metascore: foundMovie.Metascore,
          imdbRating: foundMovie.imdbRating,
          imdbVotes: foundMovie.imdbVotes,
          images: foundMovie.Images || [],
        };
        setMovie(processedMovie);
      } else {
        setMovie(null);
      }

      const sampleReviews = [
        {
          id: 1,
          user: "John Doe",
          rating: 5,
          text: "Absolutely mind-blowing! Nolan has created a masterpiece that challenges the viewer's perception of reality. The visual effects are stunning and the story is incredibly well-crafted.",
          date: "2024-01-15",
        },
        {
          id: 2,
          user: "Jane Smith",
          rating: 4,
          text: "Great movie with excellent performances. The concept is fascinating, though it can be a bit confusing at times. Definitely worth watching multiple times.",
          date: "2024-01-10",
        },
        {
          id: 3,
          user: "Mike Johnson",
          rating: 5,
          text: "One of the best sci-fi movies ever made. The layered storytelling and incredible cinematography make this a truly unforgettable experience.",
          date: "2024-01-05",
        },
      ];

      setReviews(sampleReviews);
      setLoading(false);
    }, 500);
  }, [id]);

  const handleAddToWatchlist = () => {
    actions.addToWatchlist(movie);
    // Show toast notification or update UI
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading">Loading movie details...</div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="main-content">
        <div className="error">Movie not found</div>
      </div>
    );
  }

  return (
    <div className="main-content fade-in">
      {/* Movie Hero Section */}
      <div
        className="movie-hero"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${movie.backdrop})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "4rem 2rem",
          borderRadius: "var(--border-radius)",
          marginBottom: "3rem",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "2rem",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <MoviePoster
            src={movie.poster}
            title={movie.title}
            alt={movie.title}
            className="movie-details-poster"
          />

          <div style={{ flex: 1, minWidth: "300px" }}>
            <h1
              style={{
                fontSize: "3rem",
                marginBottom: "1rem",
                fontWeight: "700",
              }}
            >
              {movie.title}
            </h1>

            <div
              style={{
                display: "flex",
                gap: "2rem",
                marginBottom: "1rem",
                flexWrap: "wrap",
              }}
            >
              <span>{movie.year}</span>
              <span>{movie.duration}</span>
              <span>{movie.genre}</span>
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <StarRating rating={movie.rating} readOnly size="large" />
            </div>

            <p
              style={{
                fontSize: "1.125rem",
                lineHeight: "1.6",
                marginBottom: "2rem",
                maxWidth: "600px",
              }}
            >
              {movie.description}
            </p>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <button
                onClick={handleAddToWatchlist}
                className="btn btn-primary"
                style={{ padding: "1rem 2rem" }}
              >
                + Add to Watchlist
              </button>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="btn btn-secondary"
                style={{
                  padding: "1rem 2rem",
                  color: "white",
                  borderColor: "white",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                }}
              >
                {showReviewForm ? "Cancel Review" : "Write Review"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Movie Info Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
          marginBottom: "3rem",
        }}
      >
        {/* Movie Details */}
        <div className="movie-card">
          <h2 className="mb-3">Movie Details</h2>
          <div style={{ display: "grid", gap: "1rem" }}>
            <div>
              <strong>Director:</strong> {movie.director}
            </div>
            <div>
              <strong>Language:</strong> {movie.language}
            </div>
            <div>
              <strong>Country:</strong> {movie.country}
            </div>
            <div>
              <strong>Budget:</strong> {movie.budget}
            </div>
            <div>
              <strong>Box Office:</strong> {movie.boxOffice}
            </div>
          </div>
        </div>

        {/* Cast */}
        <div className="movie-card">
          <h2 className="mb-3">Cast</h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {movie.cast.map((actor, index) => (
              <div
                key={index}
                style={{
                  padding: "0.5rem",
                  background: "var(--background-color)",
                  borderRadius: "var(--border-radius)",
                }}
              >
                {actor}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Review Form */}
      {showReviewForm && (
        <div className="review-form">
          <QuickReviewForm
            movieId={movie.id}
            onClose={() => setShowReviewForm(false)}
            onSubmit={(review) => {
              const newReviews = [review, ...reviews];
              setReviews(newReviews);
              localStorage.setItem(
                `reviews_${movie.id}`,
                JSON.stringify(newReviews)
              );
              setShowReviewForm(false);
            }}
          />
        </div>
      )}

      {/* Reviews Section */}
      <div className="reviews-section">
        <div className="page-header">
          <h2 className="page-title">User Reviews</h2>
          <p className="page-subtitle">
            See what other viewers think about this movie
          </p>
        </div>

        {reviews.length > 0 ? (
          <div style={{ display: "grid", gap: "1rem" }}>
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div>
                    <div className="review-author">{review.user}</div>
                    <StarRating rating={review.rating} readOnly size="small" />
                  </div>
                  <div className="review-date">
                    {new Date(review.date).toLocaleDateString()}
                  </div>
                </div>
                <p className="review-text">{review.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p>No reviews yet. Be the first to review this movie!</p>
            <Link
              to={`/movies/${movie.id}/review`}
              className="btn btn-primary mt-2"
            >
              Write the First Review
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

// Quick Review Form Component
const QuickReviewForm = ({ movieId, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating > 0 && reviewText.trim()) {
      const newReview = {
        id: Date.now(),
        user: "Current User", // This would be the logged-in user
        rating,
        text: reviewText,
        date: new Date().toISOString().split("T")[0],
      };
      onSubmit(newReview);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h3>Quick Review</h3>
        <button type="button" onClick={onClose} className="btn btn-secondary">
          ×
        </button>
      </div>

      <div className="form-group">
        <label className="form-label">Your Rating</label>
        <StarRating rating={rating} onRatingChange={setRating} size="large" />
      </div>

      <div className="form-group">
        <label className="form-label">Your Review</label>
        <textarea
          className="form-textarea"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your thoughts about this movie..."
          required
        />
      </div>

      <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
        <button type="button" onClick={onClose} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Submit Review
        </button>
      </div>
    </form>
  );
};

export default MovieDetails;
