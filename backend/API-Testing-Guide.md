# Complete API Testing Guide

## Base URL: `http://localhost:5000`

---

## 🔐 Authentication APIs (✅ Already Working)

### 1. Register User

- **Method**: POST
- **URL**: `/api/auth/register`
- **Body**:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### 2. Login User

- **Method**: POST
- **URL**: `/api/auth/login`
- **Body**:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### 3. Get Current User Profile

- **Method**: GET
- **URL**: `/api/auth/me`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **Body**: None

### 4. Update Password

- **Method**: PUT
- **URL**: `/api/auth/update-password`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **Body**:

```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```

---

## 🎬 Movie APIs

### 5. Get All Movies

- **Method**: GET
- **URL**: `/api/movies`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **Query Parameters** (optional):
  - `?page=1&limit=10`
  - `?genre=Action`
  - `?search=dark knight`
  - `?sortBy=rating&sortOrder=desc`
- **Body**: None

### 6. Get Single Movie

- **Method**: GET
- **URL**: `/api/movies/MOVIE_ID`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **Body**: None

### 7. Add New Movie (Admin Only)

- **Method**: POST
- **URL**: `/api/movies`
- **Headers**: `Authorization: Bearer ADMIN_JWT_TOKEN`
- **Body**:

```json
{
  "title": "Avengers: Endgame",
  "description": "The epic conclusion to the Infinity Saga",
  "genre": ["Action", "Adventure", "Drama"],
  "releaseYear": 2019,
  "duration": 181,
  "director": "Anthony Russo",
  "cast": [
    {
      "name": "Robert Downey Jr.",
      "character": "Tony Stark / Iron Man"
    },
    {
      "name": "Chris Evans",
      "character": "Steve Rogers / Captain America"
    }
  ],
  "posterUrl": "https://example.com/poster.jpg",
  "trailerUrl": "https://example.com/trailer.mp4"
}
```

### 8. Update Movie (Admin Only)

- **Method**: PUT
- **URL**: `/api/movies/MOVIE_ID`
- **Headers**: `Authorization: Bearer ADMIN_JWT_TOKEN`
- **Body**:

```json
{
  "title": "Updated Movie Title",
  "description": "Updated description",
  "genre": ["Action", "Thriller"]
}
```

### 9. Delete Movie (Admin Only)

- **Method**: DELETE
- **URL**: `/api/movies/MOVIE_ID`
- **Headers**: `Authorization: Bearer ADMIN_JWT_TOKEN`
- **Body**: None

---

## ⭐ Review APIs

### 10. Get Movie Reviews

- **Method**: GET
- **URL**: `/api/movies/MOVIE_ID/reviews`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **Query Parameters** (optional):
  - `?page=1&limit=5`
  - `?sortBy=createdAt&sortOrder=desc`
- **Body**: None

### 11. Add Review to Movie

- **Method**: POST
- **URL**: `/api/movies/MOVIE_ID/reviews`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **Body**:

```json
{
  "rating": 5,
  "comment": "Absolutely amazing movie! The cinematography was spectacular and the acting was top-notch. Would definitely recommend to anyone who enjoys action movies.",
  "spoilerAlert": false
}
```

### 12. Update Your Review

- **Method**: PUT
- **URL**: `/api/movies/MOVIE_ID/reviews/REVIEW_ID`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **Body**:

```json
{
  "rating": 4,
  "comment": "Updated my review - still a great movie but noticed some plot holes on second viewing.",
  "spoilerAlert": true
}
```

### 13. Delete Your Review

- **Method**: DELETE
- **URL**: `/api/movies/MOVIE_ID/reviews/REVIEW_ID`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **Body**: None

---

## 👤 User Profile APIs

### 14. Get User Profile

- **Method**: GET
- **URL**: `/api/users/USER_ID`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **Body**: None

### 15. Update User Profile

- **Method**: PUT
- **URL**: `/api/users/USER_ID`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **Body**:

```json
{
  "name": "John Updated",
  "bio": "Movie enthusiast and critic",
  "favoriteGenres": ["Action", "Sci-Fi", "Thriller"],
  "profilePicture": "https://example.com/profile.jpg"
}
```

### 16. Get User's Reviews

- **Method**: GET
- **URL**: `/api/users/USER_ID/reviews`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **Query Parameters** (optional):
  - `?page=1&limit=10`
- **Body**: None

---

## 📝 Watchlist APIs

### 17. Get User's Watchlist

- **Method**: GET
- **URL**: `/api/users/USER_ID/watchlist`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **Query Parameters** (optional):
  - `?status=want-to-watch`
  - `?status=watching`
  - `?status=watched`
  - `?priority=high`
- **Body**: None

### 18. Add Movie to Watchlist

- **Method**: POST
- **URL**: `/api/users/USER_ID/watchlist`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **Body**:

```json
{
  "movieId": "MOVIE_ID_HERE",
  "status": "want-to-watch",
  "priority": "high",
  "notes": "Heard great things about this movie",
  "reminder": {
    "enabled": true,
    "date": "2025-12-25T19:00:00.000Z"
  }
}
```

### 19. Update Watchlist Item

- **Method**: PUT
- **URL**: `/api/users/USER_ID/watchlist/WATCHLIST_ID`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **Body**:

```json
{
  "status": "watched",
  "priority": "medium",
  "notes": "Finally watched it - was amazing!",
  "rating": 5
}
```

### 20. Remove from Watchlist

- **Method**: DELETE
- **URL**: `/api/users/USER_ID/watchlist/WATCHLIST_ID`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **Body**: None

---

## 🔍 Search & Filter APIs

### 21. Search Movies

- **Method**: GET
- **URL**: `/api/movies/search`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **Query Parameters**:
  - `?q=dark knight` (search term)
  - `?genre=Action`
  - `?year=2008`
  - `?minRating=4`
- **Body**: None

### 22. Get Movie Statistics

- **Method**: GET
- **URL**: `/api/movies/MOVIE_ID/stats`
- **Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **Body**: None

---

## 🏆 Admin APIs

### Admin Login (Use these credentials)

```json
{
  "email": "admin@moviereview.com",
  "password": "Admin123!"
}
```

### 23. Get All Users (Admin Only)

- **Method**: GET
- **URL**: `/api/users`
- **Headers**: `Authorization: Bearer ADMIN_JWT_TOKEN`
- **Body**: None

### 24. Update User Role (Admin Only)

- **Method**: PUT
- **URL**: `/api/users/USER_ID/role`
- **Headers**: `Authorization: Bearer ADMIN_JWT_TOKEN`
- **Body**:

```json
{
  "role": "admin"
}
```

### 25. Deactivate User (Admin Only)

- **Method**: PUT
- **URL**: `/api/users/USER_ID/deactivate`
- **Headers**: `Authorization: Bearer ADMIN_JWT_TOKEN`
- **Body**: None

---

## 📋 Testing Workflow

### Step 1: Authentication

1. Register a new user or login with existing credentials
2. Copy the JWT token from the response
3. Use this token in the `Authorization: Bearer TOKEN` header for subsequent requests

### Step 2: Explore Movies

1. Get all movies to see the seeded data
2. Get a specific movie by copying a movie ID from the list
3. Get movie reviews and statistics

### Step 3: Add Reviews

1. Choose a movie ID
2. Add a review with rating and comment
3. Update or delete your review

### Step 4: Manage Watchlist

1. Add movies to your watchlist with different statuses
2. Update watchlist items (change status from "want-to-watch" to "watched")
3. Remove items from watchlist

### Step 5: Admin Features

1. Login as admin using provided credentials
2. Add new movies
3. Manage users and their roles

---

## 💡 Testing Tips

1. **Always include the Authorization header** for protected routes
2. **Use actual Movie IDs** from the GET /api/movies response
3. **Use actual User IDs** from your user profile or GET /api/users (admin)
4. **Check response status codes**: 200/201 for success, 400/401/403/404/500 for errors
5. **Copy IDs from responses** to use in subsequent requests

---

## 🎯 Sample Movie IDs (from seeded data)

After running GET `/api/movies`, you'll get movie IDs. Use these in place of `MOVIE_ID` in the endpoints above.

## 🎯 Getting User IDs

- Your own user ID is in the login response
- Other user IDs can be found in GET `/api/users` (admin only)
- Use these in place of `USER_ID` in the endpoints above

Happy Testing! 🚀
