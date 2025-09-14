import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [userReviews, setUserReviews] = useState([]);
  const [userStats, setUserStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    joinedDate: "",
  });

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const loadUserData = () => {
    // Load user reviews from localStorage
    const allReviews = [];
    const keys = Object.keys(localStorage);

    keys.forEach((key) => {
      if (key.startsWith("reviews_")) {
        const movieReviews = JSON.parse(localStorage.getItem(key) || "[]");
        const userMovieReviews = movieReviews.filter(
          (review) => review.user === currentUser.name
        );
        allReviews.push(...userMovieReviews);
      }
    });

    setUserReviews(allReviews);

    // Calculate user stats
    const totalReviews = allReviews.length;
    const averageRating =
      totalReviews > 0
        ? (
            allReviews.reduce((sum, review) => sum + review.rating, 0) /
            totalReviews
          ).toFixed(1)
        : 0;

    // Get user registration date
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userData = users.find((user) => user.id === currentUser.id);
    const joinedDate = userData
      ? new Date(userData.createdAt).toLocaleDateString()
      : "Unknown";

    setUserStats({
      totalReviews,
      averageRating,
      joinedDate,
    });
  };

  if (!isAuthenticated()) {
    return (
      <div className="main-content">
        <div className="auth-required-container">
          <div className="auth-required-card">
            <div className="auth-required-icon">🔐</div>
            <h1 className="auth-required-title">Login Required</h1>
            <p className="auth-required-message">
              Please log in first to view your profile and access your reviews
              and watchlist.
            </p>
            <div className="auth-required-actions">
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
              <Link to="/signup" className="btn btn-secondary">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <span className="avatar-icon">👤</span>
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{currentUser.name}</h1>
            <p className="profile-email">{currentUser.email}</p>
            <p className="profile-joined">Joined on {userStats.joinedDate}</p>
          </div>
        </div>

        {/* User Stats */}
        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-number">{userStats.totalReviews}</div>
            <div className="stat-label">Reviews Written</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{userStats.averageRating}</div>
            <div className="stat-label">Average Rating</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">⭐</div>
            <div className="stat-label">Movie Critic</div>
          </div>
        </div>

        {/* User Reviews Section */}
        <div className="profile-section">
          <h2 className="section-title">My Reviews</h2>

          {userReviews.length > 0 ? (
            <div className="reviews-list">
              {userReviews.map((review, index) => (
                <div key={`${review.id}-${index}`} className="review-item">
                  <div className="review-header">
                    <div className="review-rating">
                      {"⭐".repeat(review.rating)}
                      <span className="rating-number">({review.rating}/5)</span>
                    </div>
                    <div className="review-date">
                      {new Date(review.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="review-content">
                    <p>"{review.text}"</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <p className="empty-message">
                You haven't written any reviews yet.
              </p>
              <Link to="/movies" className="btn btn-primary">
                Explore Movies
              </Link>
            </div>
          )}
        </div>

        {/* Account Actions */}
        <div className="profile-actions">
          <button className="btn btn-outline">Edit Profile</button>
          <button className="btn btn-outline">Change Password</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
