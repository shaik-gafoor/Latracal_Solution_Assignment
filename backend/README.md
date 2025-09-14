# MovieReview Backend API

A comprehensive REST API for a movie review platform built with Node.js, Express, and MongoDB.

## Features

- 🔐 **User Authentication** - JWT-based authentication with registration and login
- 🎬 **Movie Management** - CRUD operations for movies with filtering and pagination
- ⭐ **Review System** - Users can rate and review movies with full CRUD operations
- 📚 **Watchlist Management** - Personal watchlists with status tracking
- 👤 **User Profiles** - User management with statistics and review history
- 🔍 **Search & Filter** - Advanced search and filtering capabilities
- 📊 **Statistics** - User and movie statistics with rating distributions
- 🛡️ **Data Validation** - Comprehensive input validation and error handling
- 🔒 **Authorization** - Role-based access control (Admin/User)

## Tech Stack

- **Runtime:** Node.js with ES Modules
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Validation:** express-validator
- **CORS:** Enabled for frontend integration

## Quick Start

### Prerequisites

- Node.js 16+ installed
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone and navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   The `.env` file is already configured with:

   ```env
   MONGODB_URI=mongodb+srv://gafoor7898_db_user:Kf4yNERJrOANBZWd@cluster0.1a3jbdo.mongodb.net/moviereview?retryWrites=true&w=majority
   JWT_SECRET=moviereview_jwt_secret_key_2025_secure_random_string
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

4. **Seed the database with sample movies**

   ```bash
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint    | Description       | Access  |
| ------ | ----------- | ----------------- | ------- |
| POST   | `/register` | Register new user | Public  |
| POST   | `/login`    | User login        | Public  |
| GET    | `/me`       | Get current user  | Private |
| PUT    | `/password` | Update password   | Private |

### Movie Routes (`/api/movies`)

| Method | Endpoint  | Description                              | Access |
| ------ | --------- | ---------------------------------------- | ------ |
| GET    | `/`       | Get all movies with pagination/filtering | Public |
| GET    | `/:id`    | Get single movie by ID                   | Public |
| POST   | `/`       | Create new movie                         | Admin  |
| PUT    | `/:id`    | Update movie                             | Admin  |
| DELETE | `/:id`    | Delete movie (soft delete)               | Admin  |
| GET    | `/stats`  | Get movie statistics                     | Public |
| GET    | `/search` | Search movies                            | Public |

**Query Parameters for GET /movies:**

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12, max: 100)
- `genre` - Filter by genre(s)
- `releaseYear` - Filter by release year
- `director` - Filter by director name
- `minRating` - Minimum average rating
- `maxRating` - Maximum average rating
- `search` - Search in title, director, cast, genre
- `sortBy` - Sort field (title, releaseYear, averageRating, etc.)
- `sortOrder` - asc or desc (default: desc)

### Review Routes (`/api/movies/:movieId/reviews`)

| Method | Endpoint             | Description                         | Access                |
| ------ | -------------------- | ----------------------------------- | --------------------- |
| GET    | `/`                  | Get all reviews for a movie         | Public                |
| GET    | `/:reviewId`         | Get single review                   | Public                |
| POST   | `/`                  | Create new review                   | Private               |
| PUT    | `/:reviewId`         | Update review                       | Private (Owner/Admin) |
| DELETE | `/:reviewId`         | Delete review                       | Private (Owner/Admin) |
| GET    | `/my-review`         | Get current user's review for movie | Private               |
| POST   | `/:reviewId/helpful` | Mark review as helpful              | Private               |

### User Routes (`/api/users`)

| Method | Endpoint       | Description         | Access                |
| ------ | -------------- | ------------------- | --------------------- |
| GET    | `/:id`         | Get user profile    | Public                |
| PUT    | `/:id`         | Update user profile | Private (Owner/Admin) |
| DELETE | `/:id`         | Delete user account | Private (Owner/Admin) |
| GET    | `/:id/reviews` | Get user's reviews  | Public                |
| GET    | `/:id/stats`   | Get user statistics | Public                |

### Watchlist Routes (`/api/users/:userId/watchlist`)

| Method | Endpoint           | Description                      | Access                |
| ------ | ------------------ | -------------------------------- | --------------------- |
| GET    | `/`                | Get user's watchlist             | Private (Owner/Admin) |
| POST   | `/`                | Add movie to watchlist           | Private (Owner/Admin) |
| GET    | `/:movieId`        | Get watchlist item               | Private (Owner/Admin) |
| PUT    | `/:movieId`        | Update watchlist item            | Private (Owner/Admin) |
| DELETE | `/:movieId`        | Remove from watchlist            | Private (Owner/Admin) |
| GET    | `/stats`           | Get watchlist statistics         | Private (Owner/Admin) |
| GET    | `/check/:movieId`  | Check if movie in watchlist      | Private (Owner/Admin) |
| GET    | `/recommendations` | Get personalized recommendations | Private (Owner/Admin) |

## Request/Response Examples

### Register User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "bio": "Movie enthusiast",
  "favoriteGenres": ["Action", "Sci-Fi"]
}
```

### Create Review

```bash
POST /api/movies/507f1f77bcf86cd799439011/reviews
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "rating": 5,
  "title": "Amazing movie!",
  "reviewText": "This movie exceeded all my expectations...",
  "isSpoiler": false
}
```

### Add to Watchlist

```bash
POST /api/users/507f1f77bcf86cd799439012/watchlist
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "movieId": "507f1f77bcf86cd799439011",
  "status": "want_to_watch",
  "priority": "high",
  "notes": "Recommended by a friend"
}
```

## Database Schema

### User Model

- username, email, password (hashed)
- bio, profilePicture, favoriteGenres
- isAdmin, joinDate, stats

### Movie Model

- title, genre[], releaseYear, director
- cast[], synopsis, posterUrl, duration
- language, country, ratings
- averageRating, totalReviews, ratingDistribution

### Review Model

- user (ref), movie (ref), rating (1-5)
- title, reviewText, isSpoiler
- helpfulVotes, totalVotes, timestamps

### Watchlist Model

- user (ref), movie (ref), status, priority
- dateAdded, notes, tags[], personalRating

## Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

Get the token from `/api/auth/login` or `/api/auth/register` responses.

## Error Handling

The API uses consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // For validation errors
}
```

## Sample Admin Account

After running the seed script, you can use:

- **Email:** admin@moviereview.com
- **Password:** Admin123!

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample movies

### Environment Variables

Required environment variables:

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - Token expiration time (e.g., '7d')
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS

## API Testing

Test the API using tools like:

- **Postman** - Import the collection for easy testing
- **curl** - Command line testing
- **VS Code REST Client** - Using `.rest` files

Example health check:

```bash
curl http://localhost:5000/health
```

## Features in Detail

### Advanced Filtering

- Genre-based filtering with multiple selections
- Release year range filtering
- Rating-based filtering (min/max)
- Director and cast search
- Full-text search across multiple fields

### Rating System

- 5-star rating system for movies
- Automatic average rating calculation
- Rating distribution analytics
- Review helpfulness voting

### Watchlist Features

- Multiple status options (want_to_watch, watching, watched, etc.)
- Priority levels (low, medium, high)
- Personal notes and tags
- Viewing statistics and recommendations
- Bulk operations support

### Statistics & Analytics

- User review statistics
- Movie rating distributions
- Genre preferences analysis
- Personalized recommendations based on watchlist

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Input validation and sanitization
- CORS configuration
- Rate limiting ready
- SQL injection prevention (NoSQL)
- XSS protection via input validation - Movie Review Platform

This folder will contain the Node.js/Express API for the Movie Review Platform.
