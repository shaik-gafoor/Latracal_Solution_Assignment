import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import StarRating from "../components/StarRating";
import MoviePoster from "../components/MoviePoster";
import { useMovies } from "../context/MoviesContext";
import { useAuth } from "../context/AuthContext";
import { getPosterUrl } from "../utils/posterUrls";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { movies, loading, fetchMovies } = useMovies();
  const { currentUser } = useAuth();
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [userRatings, setUserRatings] = useState({});
  const fetchingRef = useRef(false);

  useEffect(() => {
    // Load user ratings from localStorage
    const savedRatings = localStorage.getItem("userMovieRatings");
    if (savedRatings) {
      setUserRatings(JSON.parse(savedRatings));
    }

    // Always load movies when component mounts
    loadMoviesData();
  }, []);

  // Handle rating change
  const handleRatingChange = (movieId, newRating) => {
    const updatedRatings = { ...userRatings, [movieId]: newRating };
    setUserRatings(updatedRatings);
    localStorage.setItem("userMovieRatings", JSON.stringify(updatedRatings));
  };

  // Separate effect to handle user changes
  useEffect(() => {
    // Reload movies when user authentication changes
    loadMoviesData();
  }, [currentUser]);

  // Effect to handle navigation changes - reload movies when returning to Home
  useEffect(() => {
    if (location.pathname === "/") {
      // Reset fetching ref and load movies when navigating to home
      fetchingRef.current = false;
      loadMoviesData();
    }
  }, [location.pathname]);

  // Function to load movies data
  const loadMoviesData = () => {
    // Prevent multiple simultaneous fetch calls
    if (fetchingRef.current) {
      return;
    }

    // Load movies from backend API if user is logged in
    if (currentUser) {
      fetchingRef.current = true;

      fetchMovies()
        .then(() => {
          // Movies loaded successfully
        })
        .catch((error) => {
          // Fallback to static data if API fails
          loadStaticMovies();
        })
        .finally(() => {
          fetchingRef.current = false;
        });
    } else {
      // Use static data if not logged in
      loadStaticMovies();
    }
  };

  // Fallback function to load static data
  const loadStaticMovies = () => {
    // Use static data as fallback
    import("../assets/movies.json")
      .then((moviesData) => {
        const data = moviesData.default;
        // Get featured movies (first 6 movies)
        const featured = data.slice(0, 6).map((movie) => ({
          id: movie.imdbID,
          title: movie.Title,
          genre: movie.Genre,
          year: parseInt(movie.Year),
          rating: parseFloat(movie.imdbRating) / 2, // Convert to 5-star scale
          poster: getPosterUrl(movie.Title, movie.Poster),
          description: movie.Plot,
          type: movie.Type,
          comingSoon: movie.ComingSoon || false,
        }));

        // Get trending movies (movies with highest ratings)
        const trending = data
          .filter((movie) => movie.imdbRating && movie.imdbRating !== "N/A")
          .sort((a, b) => parseFloat(b.imdbRating) - parseFloat(a.imdbRating))
          .slice(0, 6)
          .map((movie) => ({
            id: movie.imdbID,
            title: movie.Title,
            genre: movie.Genre,
            year: parseInt(movie.Year),
            rating: parseFloat(movie.imdbRating) / 2,
            poster: getPosterUrl(movie.Title, movie.Poster),
            description: movie.Plot,
            type: movie.Type,
            comingSoon: movie.ComingSoon || false,
          }));

        setFeaturedMovies(featured);
        setTrendingMovies(trending);
      })
      .catch((error) => {
        // Handle error silently or with user-friendly message
      });
  };

  // Process backend movies into the format expected by the component
  useEffect(() => {
    if (movies && movies.length > 0) {
      // Convert backend movies to frontend format
      const backendMovies = movies.map((movie) => ({
        id: movie._id,
        title: movie.title,
        genre: movie.genre.join(", "),
        year: movie.releaseYear,
        rating: movie.averageRating || 0,
        poster: getPosterUrl(movie.title, movie.posterUrl),
        description: movie.description,
        type: "movie",
        comingSoon: false,
      }));

      // Set featured and trending movies from backend data
      setFeaturedMovies(backendMovies.slice(0, 6));
      setTrendingMovies(
        backendMovies.sort((a, b) => b.rating - a.rating).slice(0, 6)
      );
    } else if (!loading && featuredMovies.length === 0) {
      // If no backend movies and not loading, try static movies
      loadStaticMovies();
    }
  }, [movies, loading]);

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
