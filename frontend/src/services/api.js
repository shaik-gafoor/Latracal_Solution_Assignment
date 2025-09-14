// API configuration and service functions for connecting to backend
const API_BASE_URL = "http://localhost:5000";

// Get auth token from localStorage
const getAuthToken = () => {
  const user = localStorage.getItem("currentUser");
  if (user) {
    const parsedUser = JSON.parse(user);
    return parsedUser.token;
  }
  return null;
};

// Create headers with auth token
const createHeaders = () => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: createHeaders(),
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API call failed");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// Authentication API calls
export const authAPI = {
  register: async (userData) => {
    return apiCall("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials) => {
    return apiCall("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  getCurrentUser: async () => {
    return apiCall("/api/auth/me");
  },

  updatePassword: async (passwordData) => {
    return apiCall("/api/auth/update-password", {
      method: "PUT",
      body: JSON.stringify(passwordData),
    });
  },
};

// Movies API calls
export const moviesAPI = {
  getAllMovies: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/movies?${queryString}` : "/api/movies";
    return apiCall(endpoint);
  },

  getMovie: async (movieId) => {
    return apiCall(`/api/movies/${movieId}`);
  },

  searchMovies: async (query) => {
    return apiCall(`/api/movies/search?q=${encodeURIComponent(query)}`);
  },

  addMovie: async (movieData) => {
    return apiCall("/api/movies", {
      method: "POST",
      body: JSON.stringify(movieData),
    });
  },

  updateMovie: async (movieId, movieData) => {
    return apiCall(`/api/movies/${movieId}`, {
      method: "PUT",
      body: JSON.stringify(movieData),
    });
  },

  deleteMovie: async (movieId) => {
    return apiCall(`/api/movies/${movieId}`, {
      method: "DELETE",
    });
  },
};

// Reviews API calls
export const reviewsAPI = {
  getMovieReviews: async (movieId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/api/movies/${movieId}/reviews?${queryString}`
      : `/api/movies/${movieId}/reviews`;
    return apiCall(endpoint);
  },

  addReview: async (movieId, reviewData) => {
    return apiCall(`/api/movies/${movieId}/reviews`, {
      method: "POST",
      body: JSON.stringify(reviewData),
    });
  },

  updateReview: async (movieId, reviewId, reviewData) => {
    return apiCall(`/api/movies/${movieId}/reviews/${reviewId}`, {
      method: "PUT",
      body: JSON.stringify(reviewData),
    });
  },

  deleteReview: async (movieId, reviewId) => {
    return apiCall(`/api/movies/${movieId}/reviews/${reviewId}`, {
      method: "DELETE",
    });
  },
};

// Users API calls
export const usersAPI = {
  getUserProfile: async (userId) => {
    return apiCall(`/api/users/${userId}`);
  },

  updateUserProfile: async (userId, userData) => {
    return apiCall(`/api/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },

  getUserReviews: async (userId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/api/users/${userId}/reviews?${queryString}`
      : `/api/users/${userId}/reviews`;
    return apiCall(endpoint);
  },

  getAllUsers: async () => {
    return apiCall("/api/users");
  },
};

// Watchlist API calls
export const watchlistAPI = {
  getWatchlist: async (userId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/api/users/${userId}/watchlist?${queryString}`
      : `/api/users/${userId}/watchlist`;
    return apiCall(endpoint);
  },

  addToWatchlist: async (userId, watchlistData) => {
    return apiCall(`/api/users/${userId}/watchlist`, {
      method: "POST",
      body: JSON.stringify(watchlistData),
    });
  },

  updateWatchlistItem: async (userId, watchlistId, updateData) => {
    return apiCall(`/api/users/${userId}/watchlist/${watchlistId}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  },

  removeFromWatchlist: async (userId, watchlistId) => {
    return apiCall(`/api/users/${userId}/watchlist/${watchlistId}`, {
      method: "DELETE",
    });
  },
};

// Health check
export const healthAPI = {
  checkHealth: async () => {
    return apiCall("/health");
  },

  checkDatabase: async () => {
    return apiCall("/api/db-test");
  },
};

export default {
  authAPI,
  moviesAPI,
  reviewsAPI,
  usersAPI,
  watchlistAPI,
  healthAPI,
};
