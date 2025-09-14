# Quick Start Testing Commands

## 🚀 Step-by-Step Testing Guide

### Step 1: Get Your JWT Token

After login, copy the `token` from the response. Use it as: `Authorization: Bearer YOUR_TOKEN_HERE`

### Step 2: Get Movie IDs

**GET** `http://localhost:5000/api/movies`

- Copy movie `_id` values from the response
- Use these IDs in movie-related endpoints

### Step 3: Get Your User ID

Your user ID is in the login response as `id` field, or:
**GET** `http://localhost:5000/api/auth/me`

### Step 4: Quick Test Examples

#### Get All Movies (Copy movie IDs from here)

```
GET http://localhost:5000/api/movies
Headers: Authorization: Bearer YOUR_TOKEN
```

#### Add a Review (replace MOVIE_ID with actual ID)

```
POST http://localhost:5000/api/movies/MOVIE_ID/reviews
Headers:
  Content-Type: application/json
  Authorization: Bearer YOUR_TOKEN
Body:
{
  "rating": 5,
  "comment": "Amazing movie! Loved every minute of it."
}
```

#### Add to Watchlist (replace USER_ID and MOVIE_ID with actual IDs)

```
POST http://localhost:5000/api/users/USER_ID/watchlist
Headers:
  Content-Type: application/json
  Authorization: Bearer YOUR_TOKEN
Body:
{
  "movieId": "MOVIE_ID",
  "status": "want-to-watch",
  "priority": "high"
}
```

---

## 🎯 Available Movies (Seeded Data)

- The Shawshank Redemption (1994)
- The Dark Knight (2008)
- Pulp Fiction (1994)
- The Lord of the Rings: The Fellowship of the Ring (2001)
- Forrest Gump (1994)
- Inception (2010)
- The Matrix (1999)
- Goodfellas (1990)
- The Godfather (1972)
- Interstellar (2014)

## 🔑 Admin Access

```
Email: admin@moviereview.com
Password: Admin123!
```

Use admin token for:

- Adding/updating/deleting movies
- Managing users
- Viewing all users

---

## ⚡ Most Important Endpoints to Test

1. **GET /api/movies** - See all movies and get IDs
2. **POST /api/movies/[MOVIE_ID]/reviews** - Add reviews
3. **GET /api/movies/[MOVIE_ID]/reviews** - See movie reviews
4. **POST /api/users/[USER_ID]/watchlist** - Add to watchlist
5. **GET /api/users/[USER_ID]/watchlist** - View watchlist

Start with these and then explore the full API! 🎬
