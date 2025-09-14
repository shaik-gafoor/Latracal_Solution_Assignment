import React, { createContext, useContext, useState, useEffect } from "react";
import { moviesAPI, reviewsAPI, watchlistAPI } from "../services/api";
import { useAuth } from "./AuthContext";

const MoviesContext = createContext();

export const useMovies = () => {
  const context = useContext(MoviesContext);
  if (!context) {
    throw new Error("useMovies must be used within a MoviesProvider");
  }
  return context;
};

export const MoviesProvider = ({ children }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  // Fetch all movies
  const fetchMovies = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await moviesAPI.getAllMovies(params);
      setMovies(response.movies || response.data || []);
    } catch (error) {
      setError(error.message);
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single movie
  const fetchMovie = async (movieId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await moviesAPI.getMovie(movieId);
      return response.movie || response.data;
    } catch (error) {
      setError(error.message);
      console.error("Error fetching movie:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Search movies
  const searchMovies = async (query) => {
    setLoading(true);
    setError(null);
    try {
      const response = await moviesAPI.searchMovies(query);
      return response.movies || response.data || [];
    } catch (error) {
      setError(error.message);
      console.error("Error searching movies:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Add movie (admin only)
  const addMovie = async (movieData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await moviesAPI.addMovie(movieData);
      await fetchMovies(); // Refresh the movies list
      return response.movie || response.data;
    } catch (error) {
      setError(error.message);
      console.error("Error adding movie:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update movie (admin only)
  const updateMovie = async (movieId, movieData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await moviesAPI.updateMovie(movieId, movieData);
      await fetchMovies(); // Refresh the movies list
      return response.movie || response.data;
    } catch (error) {
      setError(error.message);
      console.error("Error updating movie:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete movie (admin only)
  const deleteMovie = async (movieId) => {
    setLoading(true);
    setError(null);
    try {
      await moviesAPI.deleteMovie(movieId);
      await fetchMovies(); // Refresh the movies list
    } catch (error) {
      setError(error.message);
      console.error("Error deleting movie:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reviews functionality
  const getMovieReviews = async (movieId, params = {}) => {
    try {
      const response = await reviewsAPI.getMovieReviews(movieId, params);
      return response.reviews || response.data || [];
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }
  };

  const addReview = async (movieId, reviewData) => {
    try {
      const response = await reviewsAPI.addReview(movieId, reviewData);
      return response.review || response.data;
    } catch (error) {
      console.error("Error adding review:", error);
      throw error;
    }
  };

  const updateReview = async (movieId, reviewId, reviewData) => {
    try {
      const response = await reviewsAPI.updateReview(
        movieId,
        reviewId,
        reviewData
      );
      return response.review || response.data;
    } catch (error) {
      console.error("Error updating review:", error);
      throw error;
    }
  };

  const deleteReview = async (movieId, reviewId) => {
    try {
      await reviewsAPI.deleteReview(movieId, reviewId);
    } catch (error) {
      console.error("Error deleting review:", error);
      throw error;
    }
  };

  // Watchlist functionality
  const getWatchlist = async (params = {}) => {
    if (!currentUser) return [];

    try {
      const response = await watchlistAPI.getWatchlist(currentUser.id, params);
      return response.watchlist || response.data || [];
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      return [];
    }
  };

  const addToWatchlist = async (movieId, watchlistData = {}) => {
    if (!currentUser) throw new Error("Must be logged in");

    try {
      const data = {
        movieId,
        status: "want-to-watch",
        priority: "medium",
        ...watchlistData,
      };
      const response = await watchlistAPI.addToWatchlist(currentUser.id, data);
      return response.watchlistItem || response.data;
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      throw error;
    }
  };

  const updateWatchlistItem = async (watchlistId, updateData) => {
    if (!currentUser) throw new Error("Must be logged in");

    try {
      const response = await watchlistAPI.updateWatchlistItem(
        currentUser.id,
        watchlistId,
        updateData
      );
      return response.watchlistItem || response.data;
    } catch (error) {
      console.error("Error updating watchlist item:", error);
      throw error;
    }
  };

  const removeFromWatchlist = async (watchlistId) => {
    if (!currentUser) throw new Error("Must be logged in");

    try {
      await watchlistAPI.removeFromWatchlist(currentUser.id, watchlistId);
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      throw error;
    }
  };

  // Load movies on mount
  useEffect(() => {
    if (currentUser) {
      fetchMovies();
    }
  }, [currentUser]);

  const value = {
    movies,
    loading,
    error,
    fetchMovies,
    fetchMovie,
    searchMovies,
    addMovie,
    updateMovie,
    deleteMovie,
    getMovieReviews,
    addReview,
    updateReview,
    deleteReview,
    getWatchlist,
    addToWatchlist,
    updateWatchlistItem,
    removeFromWatchlist,
  };

  return (
    <MoviesContext.Provider value={value}>{children}</MoviesContext.Provider>
  );
};
