import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import MovieDetails from "./pages/MovieDetails";
import Profile from "./pages/Profile";
import ReviewForm from "./pages/ReviewForm";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { AppProvider } from "./context/AppContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { MoviesProvider } from "./context/MoviesContext";
import "./styles.css";

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <MoviesProvider>
        <AppProvider>
          <Router>
            <div className="App">
              <Header />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/movies" element={<Movies />} />
                <Route path="/movies/:id" element={<MovieDetails />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/movies/:id/review" element={<ReviewForm />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
              </Routes>
              <Footer />
            </div>
          </Router>
        </AppProvider>
      </MoviesProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
