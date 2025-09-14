// Debug API endpoints - place this file in frontend/src/debug-api.js
// Run this in browser console to test API endpoints

const API_BASE_URL = "http://localhost:5000";

const testEndpoints = async () => {
  console.log("🔍 Testing API endpoints...");

  // Test health endpoint
  try {
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    console.log(
      "✅ Health endpoint:",
      healthResponse.status,
      healthResponse.statusText
    );
  } catch (error) {
    console.log("❌ Health endpoint failed:", error.message);
  }

  // Test movies endpoint (should require auth)
  try {
    const moviesResponse = await fetch(`${API_BASE_URL}/api/movies`);
    console.log(
      "📽️ Movies endpoint (no auth):",
      moviesResponse.status,
      moviesResponse.statusText
    );
  } catch (error) {
    console.log("❌ Movies endpoint failed:", error.message);
  }

  // Test auth endpoints
  try {
    const authResponse = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      }),
    });
    console.log(
      "🔐 Auth register endpoint:",
      authResponse.status,
      authResponse.statusText
    );
  } catch (error) {
    console.log("❌ Auth register failed:", error.message);
  }

  // Test non-existent endpoint (should be 404)
  try {
    const notFoundResponse = await fetch(`${API_BASE_URL}/api/nonexistent`);
    console.log(
      "🚫 Non-existent endpoint:",
      notFoundResponse.status,
      notFoundResponse.statusText
    );
  } catch (error) {
    console.log("❌ Non-existent endpoint test failed:", error.message);
  }
};

// Auto-run when loaded
testEndpoints();

export default testEndpoints;
