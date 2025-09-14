import React, { useState, useEffect } from "react";
import { moviesAPI, authAPI, reviewsAPI, watchlistAPI } from "../services/api";

const TestPage = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const testResults = {};

    // Test 1: Health check
    try {
      const health = await fetch("http://localhost:5000/health");
      const healthData = await health.json();
      testResults.health = { success: true, data: healthData };
    } catch (error) {
      testResults.health = { success: false, error: error.message };
    }

    // Test 2: Get movies
    try {
      const movies = await moviesAPI.getAllMovies();
      testResults.movies = {
        success: true,
        count: movies.movies?.length || 0,
        data: movies.movies?.slice(0, 2) || [],
      };
    } catch (error) {
      testResults.movies = { success: false, error: error.message };
    }

    // Test 3: Test user registration (with unique email)
    try {
      const randomEmail = `test${Date.now()}@example.com`;
      const registerData = await authAPI.register({
        name: "Test User",
        email: randomEmail,
        password: "password123",
        confirmPassword: "password123",
      });
      testResults.register = { success: true, user: registerData };
    } catch (error) {
      testResults.register = { success: false, error: error.message };
    }

    setResults(testResults);
    setLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>System Test Results</h1>
      <button onClick={runTests} disabled={loading}>
        {loading ? "Running Tests..." : "Run Tests Again"}
      </button>

      <div style={{ marginTop: "20px" }}>
        <h2>Test Results:</h2>
        <pre style={{ background: "#f5f5f5", padding: "10px" }}>
          {JSON.stringify(results, null, 2)}
        </pre>
      </div>

      {results.movies?.success && (
        <div style={{ marginTop: "20px" }}>
          <h2>Sample Movies:</h2>
          {results.movies.data.map((movie, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                margin: "10px 0",
              }}
            >
              <h3>{movie.title}</h3>
              <p>
                <strong>Year:</strong> {movie.releaseYear}
              </p>
              <p>
                <strong>Genre:</strong> {movie.genre?.join(", ")}
              </p>
              <p>
                <strong>Director:</strong> {movie.director}
              </p>
              {movie.posterUrl && (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  style={{
                    width: "100px",
                    height: "150px",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "block";
                  }}
                />
              )}
              <div
                style={{
                  display: "none",
                  background: "#ddd",
                  width: "100px",
                  height: "150px",
                  textAlign: "center",
                  lineHeight: "150px",
                }}
              >
                No Image
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestPage;
