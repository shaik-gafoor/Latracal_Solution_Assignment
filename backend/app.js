import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Load environment variables
dotenv.config();

// Import middleware
import { errorHandler, notFound } from "./middleware/error.js";

// Import routes
import authRoutes from "./routes/auth.js";
import movieRoutes from "./routes/movies.js";
import reviewRoutes from "./routes/reviews.js";
import userRoutes from "./routes/users.js";
import watchlistRoutes from "./routes/watchlist.js";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // Wait up to 30 seconds
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error("Database connection error:", error);
    console.log(
      "Please check your MongoDB Atlas IP whitelist and connection string."
    );
    return false;
  }
};

// Initialize database connection
let dbConnected = false;
connectDB().then((connected) => {
  dbConnected = connected;
});

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    database: {
      status: dbStatus[dbState],
      readyState: dbState,
    },
  });
});

// Database connection middleware
const checkDatabaseConnection = (req, res, next) => {
  const dbState = mongoose.connection.readyState;
  if (dbState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database is not connected. Please try again later.",
      error: "DATABASE_NOT_CONNECTED",
    });
  }
  next();
};

// Database connectivity test endpoint
app.get("/api/db-test", async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    if (dbState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database not connected",
        dbState,
      });
    }

    // Try a simple database operation
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    res.json({
      success: true,
      message: "Database connection is working",
      collections: collections.map((c) => c.name),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// API routes
app.use("/api/auth", checkDatabaseConnection, authRoutes);
app.use("/api/movies", checkDatabaseConnection, movieRoutes);
app.use("/api/movies/:movieId/reviews", checkDatabaseConnection, reviewRoutes);
app.use("/api/users", checkDatabaseConnection, userRoutes);
app.use(
  "/api/users/:userId/watchlist",
  checkDatabaseConnection,
  watchlistRoutes
);

// Test route
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working!",
    endpoints: [
      "GET /api/health - Health check",
      "POST /api/auth/register - Register user",
      "POST /api/auth/login - Login user",
      "GET /api/auth/me - Get current user",
      "GET /api/movies - Get all movies",
      "GET /api/movies/:id - Get single movie",
      "POST /api/movies - Create movie (admin)",
      "GET /api/movies/:id/reviews - Get movie reviews",
      "POST /api/movies/:id/reviews - Create review",
      "GET /api/users/:id - Get user profile",
      "PUT /api/users/:id - Update user profile",
      "GET /api/users/:id/watchlist - Get user watchlist",
      "POST /api/users/:id/watchlist - Add to watchlist",
    ],
  });
});

// Handle 404 errors
app.use(notFound);

// Error handler middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log("Unhandled Promise Rejection:", err.message);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception:", err.message);
  console.log("Shutting down...");
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received");
  console.log("Shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});

export default app;
