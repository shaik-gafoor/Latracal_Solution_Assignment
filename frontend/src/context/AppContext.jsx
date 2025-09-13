import React, { createContext, useReducer, useContext } from "react";

const initialState = {
  user: null,
  movies: [],
  featuredMovies: [],
  trendingMovies: [],
  watchlist: [],
  reviews: [],
  searchResults: [],
  searchQuery: "",
  filters: {
    genre: "",
    year: "",
    rating: "",
  },
  loading: false,
  error: null,
};

export const AppContext = createContext();

// Action Types
export const ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  SET_MOVIES: "SET_MOVIES",
  SET_FEATURED_MOVIES: "SET_FEATURED_MOVIES",
  SET_TRENDING_MOVIES: "SET_TRENDING_MOVIES",
  SET_SEARCH_RESULTS: "SET_SEARCH_RESULTS",
  SET_SEARCH_QUERY: "SET_SEARCH_QUERY",
  SET_FILTERS: "SET_FILTERS",
  ADD_TO_WATCHLIST: "ADD_TO_WATCHLIST",
  REMOVE_FROM_WATCHLIST: "REMOVE_FROM_WATCHLIST",
  ADD_REVIEW: "ADD_REVIEW",
  SET_USER: "SET_USER",
  CLEAR_ERROR: "CLEAR_ERROR",
};

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case ACTIONS.SET_MOVIES:
      return {
        ...state,
        movies: action.payload,
        loading: false,
      };

    case ACTIONS.SET_FEATURED_MOVIES:
      return {
        ...state,
        featuredMovies: action.payload,
      };

    case ACTIONS.SET_TRENDING_MOVIES:
      return {
        ...state,
        trendingMovies: action.payload,
      };

    case ACTIONS.SET_SEARCH_RESULTS:
      return {
        ...state,
        searchResults: action.payload,
        loading: false,
      };

    case ACTIONS.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload,
      };

    case ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };

    case ACTIONS.ADD_TO_WATCHLIST:
      return {
        ...state,
        watchlist: [...state.watchlist, action.payload],
      };

    case ACTIONS.REMOVE_FROM_WATCHLIST:
      return {
        ...state,
        watchlist: state.watchlist.filter(
          (movie) => movie.id !== action.payload
        ),
      };

    case ACTIONS.ADD_REVIEW:
      return {
        ...state,
        reviews: [...state.reviews, action.payload],
      };

    case ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
      };

    default:
      return state;
  }
}

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Action creators
  const actions = {
    setLoading: (loading) =>
      dispatch({ type: ACTIONS.SET_LOADING, payload: loading }),
    setError: (error) => dispatch({ type: ACTIONS.SET_ERROR, payload: error }),
    clearError: () => dispatch({ type: ACTIONS.CLEAR_ERROR }),
    setMovies: (movies) =>
      dispatch({ type: ACTIONS.SET_MOVIES, payload: movies }),
    setFeaturedMovies: (movies) =>
      dispatch({ type: ACTIONS.SET_FEATURED_MOVIES, payload: movies }),
    setTrendingMovies: (movies) =>
      dispatch({ type: ACTIONS.SET_TRENDING_MOVIES, payload: movies }),
    setSearchResults: (results) =>
      dispatch({ type: ACTIONS.SET_SEARCH_RESULTS, payload: results }),
    setSearchQuery: (query) =>
      dispatch({ type: ACTIONS.SET_SEARCH_QUERY, payload: query }),
    setFilters: (filters) =>
      dispatch({ type: ACTIONS.SET_FILTERS, payload: filters }),
    addToWatchlist: (movie) =>
      dispatch({ type: ACTIONS.ADD_TO_WATCHLIST, payload: movie }),
    removeFromWatchlist: (movieId) =>
      dispatch({ type: ACTIONS.REMOVE_FROM_WATCHLIST, payload: movieId }),
    addReview: (review) =>
      dispatch({ type: ACTIONS.ADD_REVIEW, payload: review }),
    setUser: (user) => dispatch({ type: ACTIONS.SET_USER, payload: user }),
  };

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
