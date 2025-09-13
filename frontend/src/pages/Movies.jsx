import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import StarRating from "../components/StarRating";
import MoviePoster from "../components/MoviePoster";
import moviesData from "../assets/movies.json";

const Movies = () => {
  const { state, actions } = useAppContext();
  const location = useLocation();

  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [moviesPerPage] = useState(12);

  const [userRatings, setUserRatings] = useState({});

  // Filters state
  const [filters, setFilters] = useState({
    genre: "",
    year: "",
    rating: "",
    sortBy: "title",
  });

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

  // Load movie data from JSON
  useEffect(() => {
    setTimeout(() => {
      const processedMovies = moviesData.map((movie) => ({
        id: movie.imdbID,
        title: movie.Title,
        genre: movie.Genre.split(",")[0].trim(), // Get first genre for filtering
        fullGenre: movie.Genre,
        year: parseInt(movie.Year),
        rating:
          movie.imdbRating && movie.imdbRating !== "N/A"
            ? parseFloat(movie.imdbRating) / 2
            : 0,
        poster: movie.Poster,
        description: movie.Plot,
        type: movie.Type,
        comingSoon: movie.ComingSoon || false,
        director: movie.Director,
        actors: movie.Actors,
        runtime: movie.Runtime,
        rated: movie.Rated,
      }));

      console.log("Processed movies:", processedMovies.length, processedMovies);
      setMovies(processedMovies);
      setFilteredMovies(processedMovies);
      setLoading(false);
    }, 800);
  }, []);

  // Handle URL search params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get("search");
    const genreParam = searchParams.get("genre");

    if (searchQuery) {
      actions.setSearchQuery(searchQuery);
      handleSearch(searchQuery);
    }

    if (genreParam) {
      setFilters((prev) => ({ ...prev, genre: genreParam }));
    }
  }, [location.search]);

  // Filter and sort movies
  useEffect(() => {
    let result = [...movies];

    // Search filter
    if (state.searchQuery) {
      result = result.filter(
        (movie) =>
          movie.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          movie.genre.toLowerCase().includes(state.searchQuery.toLowerCase())
      );
    }

    // Genre filter
    if (filters.genre) {
      result = result.filter((movie) =>
        movie.genre.toLowerCase().includes(filters.genre.toLowerCase())
      );
    }

    // Year filter
    if (filters.year) {
      result = result.filter((movie) => movie.year.toString() === filters.year);
    }

    // Rating filter
    if (filters.rating) {
      const minRating = parseFloat(filters.rating);
      result = result.filter((movie) => movie.rating >= minRating);
    }

    // Sort movies
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case "year":
          return b.year - a.year;
        case "rating":
          return b.rating - a.rating;
        case "title":
        default:
          return a.title.localeCompare(b.title);
      }
    });

    setFilteredMovies(result);
    setCurrentPage(1);
  }, [movies, state.searchQuery, filters]);

  const handleSearch = (query) => {
    actions.setSearchQuery(query);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      genre: "",
      year: "",
      rating: "",
      sortBy: "title",
    });
    actions.setSearchQuery("");
  };

  // Pagination
  const indexOfLastMovie = currentPage * moviesPerPage;
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
  const currentMovies = filteredMovies.slice(
    indexOfFirstMovie,
    indexOfLastMovie
  );
  const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);

  console.log("Debug - filteredMovies:", filteredMovies.length);
  console.log("Debug - currentMovies:", currentMovies.length);
  console.log("Debug - loading:", loading);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading">Loading movies...</div>
      </div>
    );
  }

  return (
    <div className="main-content fade-in">
      <div className="page-header">
        <h1 className="page-title">Movie Collection</h1>
        <p className="page-subtitle">
          Discover, search, and explore our extensive movie library
        </p>
      </div>

      {/* Search Bar */}
      <div className="movie-search">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search movies by title or genre..."
            value={state.searchQuery || ""}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
          <button
            type="button"
            className="search-btn"
            onClick={() => handleSearch("")}
            title="Clear search"
          >
            {state.searchQuery ? "✕" : "🔍"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">Genre</label>
            <select
              className="filter-select"
              value={filters.genre}
              onChange={(e) => handleFilterChange("genre", e.target.value)}
            >
              <option value="">All Genres</option>
              <option value="action">Action</option>
              <option value="sci-fi">Sci-Fi</option>
              <option value="crime">Crime</option>
              <option value="drama">Drama</option>
              <option value="comedy">Comedy</option>
              <option value="thriller">Thriller</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Year</label>
            <select
              className="filter-select"
              value={filters.year}
              onChange={(e) => handleFilterChange("year", e.target.value)}
            >
              <option value="">All Years</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
              <option value="2010">2010s</option>
              <option value="2000">2000s</option>
              <option value="1990">1990s</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Minimum Rating</label>
            <select
              className="filter-select"
              value={filters.rating}
              onChange={(e) => handleFilterChange("rating", e.target.value)}
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
              <option value="3.0">3.0+ Stars</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Sort By</label>
            <select
              className="filter-select"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            >
              <option value="title">Title (A-Z)</option>
              <option value="year">Year (Newest)</option>
              <option value="rating">Rating (Highest)</option>
            </select>
          </div>
        </div>

        {(state.searchQuery ||
          filters.genre ||
          filters.year ||
          filters.rating) && (
          <div className="mt-3" style={{ textAlign: "center" }}>
            <button onClick={clearFilters} className="btn btn-secondary">
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Results Info */}
      <div
        className="results-info mb-3"
        style={{ textAlign: "center", color: "var(--text-secondary)" }}
      >
        {state.searchQuery && <p>Search results for "{state.searchQuery}": </p>}
        <p>Showing {filteredMovies.length} movies</p>
      </div>

      {/* Movies Grid */}
      <div
        style={{
          padding: "1rem",
          backgroundColor: "#f0f0f0",
          margin: "1rem 0",
        }}
      >
        <p>Debug Info:</p>
        <p>Loading: {loading ? "Yes" : "No"}</p>
        <p>Total Movies: {movies.length}</p>
        <p>Filtered Movies: {filteredMovies.length}</p>
        <p>Current Movies: {currentMovies.length}</p>
      </div>

      {currentMovies.length > 0 ? (
        <>
          <div className="movies-grid">
            {currentMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              className="pagination mt-4"
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-secondary"
                style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => paginate(index + 1)}
                  className={`btn ${
                    currentPage === index + 1 ? "btn-primary" : "btn-secondary"
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn btn-secondary"
                style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center mt-4">
          <h3>No movies found</h3>
          <p>Try adjusting your filters or search terms</p>
          <button onClick={clearFilters} className="btn btn-primary mt-2">
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

// Movie Card Component
const MovieCard = ({ movie }) => {
  const { actions } = useAppContext();

  const handleAddToWatchlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    actions.addToWatchlist(movie);
    // You might want to show a toast notification here
  };

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
          {movie.fullGenre || movie.genre} • {movie.year}
        </p>

        {!movie.comingSoon && (
          <div className="movie-rating">
            <StarRating
              rating={userRatings[movie.id] || movie.rating}
              onRatingChange={(newRating) =>
                handleRatingChange(movie.id, newRating)
              }
              size="small"
            />
          </div>
        )}

        <p className="movie-description">
          {movie.description.length > 100
            ? movie.description.substring(0, 100) + "..."
            : movie.description}
        </p>

        <div className="movie-actions">
          <Link to={`/movies/${movie.id}`} className="btn btn-primary">
            {movie.comingSoon ? "Learn More" : "View Details"}
          </Link>
          {!movie.comingSoon && (
            <button
              onClick={handleAddToWatchlist}
              className="btn btn-secondary"
            >
              + Watchlist
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Movies;
