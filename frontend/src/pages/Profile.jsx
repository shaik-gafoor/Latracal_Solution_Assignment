import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usersAPI } from "../services/api";

const Profile = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [userStats, setUserStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    joinedDate: "Recently",
  });
  const [loading, setLoading] = useState(true);

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Only try to fetch data if user has a valid MongoDB ObjectId
      if (currentUser && currentUser.id && currentUser.id.length === 24) {
        try {
          // Fetch both user profile and reviews
          const [profileResponse, reviewsResponse] = await Promise.allSettled([
            usersAPI.getUserProfile(currentUser.id),
            usersAPI.getUserReviews(currentUser.id),
          ]);

          let joinedDate = "Recently";
          if (
            profileResponse.status === "fulfilled" &&
            profileResponse.value.data?.user?.joinDate
          ) {
            const joinDate = new Date(profileResponse.value.data.user.joinDate);
            joinedDate = joinDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            });
          }

          // Process reviews
          let totalReviews = 0;
          let averageRating = 0;
          if (reviewsResponse.status === "fulfilled") {
            const reviews = reviewsResponse.value.data?.reviews || [];
            totalReviews = reviews.length;
            if (totalReviews > 0) {
              const totalRating = reviews.reduce(
                (sum, review) => sum + (review.rating || 0),
                0
              );
              averageRating = (totalRating / totalReviews).toFixed(1);
            }
          }

          setUserStats({
            totalReviews,
            averageRating,
            joinedDate,
          });
        } catch (apiError) {
          // API call failed, use defaults
          setUserStats({
            totalReviews: 0,
            averageRating: 0,
            joinedDate: "Recently",
          });
        }
      } else {
        // User doesn't have valid ObjectId, use defaults
        setUserStats({
          totalReviews: 0,
          averageRating: 0,
          joinedDate: "Recently",
        });
      }
    } catch (error) {
      // Set defaults if anything fails
      setUserStats({
        totalReviews: 0,
        averageRating: 0,
        joinedDate: "Recently",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated() || !currentUser) {
    return (
      <div className="main-content">
        <div className="auth-required-container">
          <h1>Login Required</h1>
          <p>Please log in to view your profile.</p>
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="profile-container">
        <div className="profile-header">
          <div className="user-avatar">
            <div
              className="avatar-circle"
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "#4a90e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "24px",
                fontWeight: "bold",
                marginBottom: "15px",
              }}
            >
              {getUserInitials(currentUser?.name)}
            </div>
          </div>
          <div className="user-info">
            <h1 style={{ marginBottom: "8px", color: "#333" }}>
              Welcome, {currentUser?.name || "User"}!
            </h1>
            <p
              className="user-email"
              style={{
                fontSize: "16px",
                color: "#666",
                marginBottom: "5px",
              }}
            >
              {currentUser?.email || "No email available"}
            </p>
            <p
              className="member-since"
              style={{
                fontSize: "14px",
                color: "#888",
                marginBottom: "10px",
              }}
            >
              Member since {userStats.joinedDate}
            </p>
            <div className="user-status">
              <span
                className="status-badge"
                style={{
                  backgroundColor: "#28a745",
                  color: "white",
                  padding: "4px 12px",
                  borderRadius: "15px",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                Active Member
              </span>
            </div>
          </div>
        </div>

        <div
          className="profile-stats"
          style={{
            display: "flex",
            gap: "20px",
            margin: "30px 0",
            flexWrap: "wrap",
          }}
        >
          <div
            className="stat-card"
            style={{
              backgroundColor: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
              minWidth: "150px",
              border: "1px solid #e9ecef",
            }}
          >
            <h3
              style={{
                fontSize: "28px",
                margin: "0 0 8px 0",
                color: "#4a90e2",
                fontWeight: "bold",
              }}
            >
              {userStats.totalReviews || 0}
            </h3>
            <p style={{ margin: "0", color: "#666", fontWeight: "500" }}>
              Reviews Written
            </p>
            {userStats.totalReviews > 0 && (
              <p
                style={{ margin: "5px 0 0 0", color: "#888", fontSize: "12px" }}
              >
                {userStats.totalReviews === 1
                  ? "1 review"
                  : `${userStats.totalReviews} reviews`}
              </p>
            )}
            {userStats.totalReviews === 0 && (
              <p
                style={{ margin: "5px 0 0 0", color: "#ccc", fontSize: "12px" }}
              >
                No reviews yet
              </p>
            )}
          </div>
          <div
            className="stat-card"
            style={{
              backgroundColor: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
              minWidth: "150px",
              border: "1px solid #e9ecef",
            }}
          >
            <h3
              style={{
                fontSize: "28px",
                margin: "0 0 8px 0",
                color: "#ffc107",
                fontWeight: "bold",
              }}
            >
              {userStats.averageRating || "0.0"}
            </h3>
            <p style={{ margin: "0", color: "#666", fontWeight: "500" }}>
              Average Rating
            </p>
            {userStats.averageRating > 0 && (
              <p
                style={{ margin: "5px 0 0 0", color: "#888", fontSize: "12px" }}
              >
                out of 5 stars
              </p>
            )}
            {userStats.averageRating === 0 && (
              <p
                style={{ margin: "5px 0 0 0", color: "#ccc", fontSize: "12px" }}
              >
                No ratings yet
              </p>
            )}
          </div>
          <div
            className="stat-card"
            style={{
              backgroundColor: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
              minWidth: "150px",
              border: "1px solid #e9ecef",
            }}
          >
            <h3
              style={{
                fontSize: "28px",
                margin: "0 0 8px 0",
                color: "#28a745",
                fontWeight: "bold",
              }}
            >
              {currentUser?.id ? "✓" : "✗"}
            </h3>
            <p style={{ margin: "0", color: "#666", fontWeight: "500" }}>
              Profile Status
            </p>
            <p style={{ margin: "5px 0 0 0", color: "#888", fontSize: "12px" }}>
              {currentUser?.id ? "Verified User" : "Unverified"}
            </p>
          </div>
        </div>

        <div className="profile-actions">
          <Link to="/movies" className="btn btn-primary">
            Browse Movies
          </Link>
          <Link to="/watchlist" className="btn btn-secondary">
            View Watchlist
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;
