import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import StarRating from "../components/StarRating";
import MoviePoster from "../components/MoviePoster";
import moviesData from "../assets/movies.json";

const Home = () => {
  const navigate = useNavigate();
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRatings, setUserRatings] = useState({});

  // Load user ratings from localStorage
  useEffect(() => {
    const savedRatings = localStorage.getItem("userMovieRatings");
    if (savedRatings) {
      setUserRatings(JSON.parse(savedRatings));
    }
  }, []);

  // Handle rating change
  const handleRatingChange = (movieId, newRating) => {
    const updatedRatings = { ...userRatings, [movieId]: newRating };
    setUserRatings(updatedRatings);
    localStorage.setItem("userMovieRatings", JSON.stringify(updatedRatings));
  };

  useEffect(() => {
    // Simulate API call with real movie data
    setTimeout(() => {
      // Get featured movies (first 6 movies)
      const featured = moviesData.slice(0, 6).map((movie) => ({
        id: movie.imdbID,
        title: movie.Title,
        genre: movie.Genre,
        year: parseInt(movie.Year),
        rating: parseFloat(movie.imdbRating) / 2, // Convert to 5-star scale
        poster: movie.Poster,
        description: movie.Plot,
        type: movie.Type,
        comingSoon: movie.ComingSoon || false,
      }));

      // Get trending movies (movies with highest ratings)
      const trending = moviesData
        .filter((movie) => movie.imdbRating && movie.imdbRating !== "N/A")
        .sort((a, b) => parseFloat(b.imdbRating) - parseFloat(a.imdbRating))
        .slice(0, 6)
        .map((movie) => ({
          id: movie.imdbID,
          title: movie.Title,
          genre: movie.Genre,
          year: parseInt(movie.Year),
          rating: parseFloat(movie.imdbRating) / 2, // Convert to 5-star scale
          poster: movie.Poster,
          type: movie.Type,
          comingSoon: movie.ComingSoon || false,
        }));

      setFeaturedMovies(featured);
      setTrendingMovies(trending);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading">Loading amazing movies...</div>
      </div>
    );
  }

  return (
    <div className="main-content fade-in">
      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">Discover Amazing Movies</h1>
        <p className="hero-subtitle">
          Read reviews, rate films, and find your next favorite movie
        </p>
        <Link to="/movies" className="hero-btn">
          Explore Movies
        </Link>
      </section>

      {/* Featured Movies Section */}
      <section className="featured-section">
        <div className="page-header">
          <h2 className="page-title">Featured Movies</h2>
          <p className="page-subtitle">
            Hand-picked selections from our editorial team
          </p>
        </div>

        <div className="movies-grid">
          {featuredMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              userRating={userRatings[movie.id]}
              onRatingChange={handleRatingChange}
            />
          ))}
        </div>
      </section>

      {/* Trending Movies Section */}
      <section className="trending-section mt-4">
        <div className="page-header">
          <h2 className="page-title">Trending Now</h2>
          <p className="page-subtitle">What everyone's watching right now</p>
        </div>

        <div className="movies-grid">
          {trendingMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              userRating={userRatings[movie.id]}
              onRatingChange={handleRatingChange}
            />
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section mt-4">
        <div className="hero" style={{ padding: "3rem 2rem" }}>
          <h2 className="hero-title" style={{ fontSize: "2rem" }}>
            Join Our Community
          </h2>
          <p className="hero-subtitle">
            Share your thoughts, read reviews, and discover new favorites
          </p>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button className="hero-btn">Sign Up Today</button>
            <Link
              to="/movies"
              className="btn btn-secondary"
              style={{ color: "white", borderColor: "white" }}
            >
              Browse Movies
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

// Movie Card Component
const MovieCard = ({ movie, userRating, onRatingChange }) => {
  return (
    <div className="movie-card">
      <div className="movie-poster-container">
        <MoviePoster
          src={movie.poster}
          title={movie.title}
          alt={movie.title}
          className="movie-poster"
        />
        {movie.comingSoon && (
          <div className="coming-soon-badge">Coming Soon</div>
        )}
      </div>
      <div className="movie-content">
        <h3 className="movie-title">{movie.title}</h3>
        <p className="movie-genre">
          {movie.genre} • {movie.year}
        </p>

        {!movie.comingSoon && (
          <div className="movie-rating">
            <StarRating
              rating={userRating || movie.rating}
              onRatingChange={(newRating) =>
                onRatingChange(movie.id, newRating)
              }
              size="small"
            />
          </div>
        )}

        {movie.description && (
          <p className="movie-description">
            {movie.description.length > 100
              ? movie.description.substring(0, 100) + "..."
              : movie.description}
          </p>
        )}

        <div className="movie-actions">
          <Link to={`/movies/${movie.id}`} className="btn btn-primary">
            {movie.comingSoon ? "Learn More" : "View Details"}
          </Link>
          {!movie.comingSoon && (
            <button className="btn btn-secondary">+ Watchlist</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
