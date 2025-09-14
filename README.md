# 🎬 Movie Review Platform

A full-stack web application for movie enthusiasts to discover, review, and manage their favorite films. Built with React.js frontend and Node.js/Express backend with MongoDB Atlas integration.

![Node.js](https://img.shields.io/badge/Node.js-20.19%2B-green)
![React](https://img.shields.io/badge/React-18.0%2B-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![Express.js](https://img.shields.io/badge/Express.js-4.x-lightgrey)

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Design Decisions](#design-decisions)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🎯 Core Functionality

- **User Authentication** - Secure registration and login with JWT tokens
- **Movie Discovery** - Browse and search through a curated movie database
- **Review System** - Rate and review movies with detailed feedback
- **Watchlist Management** - Personal watchlist with status tracking
- **User Profiles** - Personalized user profiles with review history
- **Admin Panel** - Movie management and user administration

### 🔧 Technical Features

- **RESTful API** - Comprehensive backend API with 25+ endpoints
- **Real-time Updates** - Dynamic content updates
- **Responsive Design** - Mobile-first responsive UI
- **Data Validation** - Input validation and error handling
- **Search & Filter** - Advanced movie search and filtering
- **Role-based Access** - User and admin role management

## 🛠 Technology Stack

### Frontend

- **React.js** - Modern UI library with hooks and context
- **React Router** - Client-side routing
- **Context API** - State management
- **Vite** - Fast build tool and development server
- **CSS3** - Custom responsive styling

### Backend

- **Node.js** - Server-side JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB Atlas** - Cloud NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation middleware

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Postman** - API testing
- **Git** - Version control

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20.19+ or v22.12+)
- **npm** (v9.0+ or yarn)
- **Git**
- **MongoDB Atlas Account** (free tier available)
- **Code Editor** (VS Code recommended)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/shaik-gafoor/Latracal_Solution_Assignment.git
cd Latracal_Solution_Assignment
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configurations (see Environment Variables section)

# Seed the database with sample data
node scripts/seedMovies.js

# Start the backend server
npm run dev
# Server will run on http://localhost:5000
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start the development server
npm run dev
# Frontend will run on http://localhost:5173
```

## 🔐 Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/movie-reviews?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Server Configuration
NODE_ENV=development
PORT=5000

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Optional: Email Configuration (for future features)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Required Environment Variables:

- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Secret key for JWT token signing (minimum 32 characters)
- `NODE_ENV` - Environment mode (development/production)
- `PORT` - Server port (default: 5000)
- `FRONTEND_URL` - Frontend URL for CORS configuration

## 🗄️ Database Setup

### MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**

   - Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free account and cluster

2. **Configure Network Access**

   - Go to Network Access → Add IP Address
   - Add `0.0.0.0/0` for development (allow from anywhere)
   - Or add your specific IP address for better security

3. **Create Database User**

   - Go to Database Access → Add New Database User
   - Create username and password
   - Grant read/write access to any database

4. **Get Connection String**

   - Go to Clusters → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Add database name: `movie-reviews`

5. **Update Environment Variables**
   - Add the complete connection string to `MONGODB_URI` in `.env`

### Database Seeding

The application includes a seeding script that populates the database with:

- **10 Popular Movies** (Shawshank Redemption, Dark Knight, etc.)
- **Admin User** (admin@moviereview.com / Admin123!)
- **Sample Data** for testing

```bash
# Run the seeding script
cd backend
node scripts/seedMovies.js
```

### Database Schema

The application uses four main collections:

#### Users Collection

```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  profilePicture: String,
  bio: String,
  favoriteGenres: [String],
  stats: {
    totalReviews: Number,
    averageRating: Number,
    moviesWatched: Number
  },
  isActive: Boolean,
  createdAt: Date
}
```

#### Movies Collection

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  genre: [String],
  releaseYear: Number,
  duration: Number,
  director: String,
  cast: [{
    name: String,
    character: String
  }],
  posterUrl: String,
  trailerUrl: String,
  averageRating: Number,
  totalReviews: Number,
  isActive: Boolean,
  createdAt: Date
}
```

#### Reviews Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  movie: ObjectId (ref: Movie),
  rating: Number (1-5),
  comment: String,
  spoilerAlert: Boolean,
  helpfulCount: Number,
  isActive: Boolean,
  createdAt: Date
}
```

#### Watchlist Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  movie: ObjectId (ref: Movie),
  status: String (want-to-watch/watching/watched),
  priority: String (low/medium/high),
  notes: String,
  reminder: {
    enabled: Boolean,
    date: Date
  },
  dateAdded: Date,
  dateWatched: Date
}
```

## 🏃‍♂️ Running the Application

### Development Mode

1. **Start Backend Server**

```bash
cd backend
npm run dev
# Backend runs on http://localhost:5000
```

2. **Start Frontend Server** (in a new terminal)

```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

3. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/health

### Production Mode

1. **Build Frontend**

```bash
cd frontend
npm run build
```

2. **Start Backend in Production**

```bash
cd backend
NODE_ENV=production npm start
```

### Testing the Connection

Use the provided HTML test page for immediate testing:

```bash
# Open in browser
file:///path/to/frontend/test-connection.html
```

## 📚 API Documentation

### Base URL

```
Development: http://localhost:5000
Production: https://your-domain.com
```

### Authentication

All protected routes require JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### API Endpoints

#### 🔐 Authentication Endpoints

| Method | Endpoint                    | Description       | Auth Required |
| ------ | --------------------------- | ----------------- | ------------- |
| POST   | `/api/auth/register`        | User registration | No            |
| POST   | `/api/auth/login`           | User login        | No            |
| GET    | `/api/auth/me`              | Get current user  | Yes           |
| PUT    | `/api/auth/update-password` | Update password   | Yes           |

#### 🎬 Movies Endpoints

| Method | Endpoint             | Description       | Auth Required |
| ------ | -------------------- | ----------------- | ------------- |
| GET    | `/api/movies`        | Get all movies    | Yes           |
| GET    | `/api/movies/:id`    | Get movie details | Yes           |
| POST   | `/api/movies`        | Add new movie     | Admin         |
| PUT    | `/api/movies/:id`    | Update movie      | Admin         |
| DELETE | `/api/movies/:id`    | Delete movie      | Admin         |
| GET    | `/api/movies/search` | Search movies     | Yes           |

#### ⭐ Reviews Endpoints

| Method | Endpoint                           | Description       | Auth Required |
| ------ | ---------------------------------- | ----------------- | ------------- |
| GET    | `/api/movies/:movieId/reviews`     | Get movie reviews | Yes           |
| POST   | `/api/movies/:movieId/reviews`     | Add review        | Yes           |
| PUT    | `/api/movies/:movieId/reviews/:id` | Update review     | Yes (Owner)   |
| DELETE | `/api/movies/:movieId/reviews/:id` | Delete review     | Yes (Owner)   |

#### 👤 User Endpoints

| Method | Endpoint                 | Description         | Auth Required |
| ------ | ------------------------ | ------------------- | ------------- |
| GET    | `/api/users`             | Get all users       | Admin         |
| GET    | `/api/users/:id`         | Get user profile    | Yes           |
| PUT    | `/api/users/:id`         | Update user profile | Yes (Owner)   |
| GET    | `/api/users/:id/reviews` | Get user reviews    | Yes           |

#### 📝 Watchlist Endpoints

| Method | Endpoint                           | Description           | Auth Required |
| ------ | ---------------------------------- | --------------------- | ------------- |
| GET    | `/api/users/:userId/watchlist`     | Get user watchlist    | Yes (Owner)   |
| POST   | `/api/users/:userId/watchlist`     | Add to watchlist      | Yes (Owner)   |
| PUT    | `/api/users/:userId/watchlist/:id` | Update watchlist item | Yes (Owner)   |
| DELETE | `/api/users/:userId/watchlist/:id` | Remove from watchlist | Yes (Owner)   |

### Request/Response Examples

#### User Registration

```javascript
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "jwt_token_here"
}
```

#### Add Movie Review

```javascript
POST /api/movies/:movieId/reviews
Authorization: Bearer TOKEN
{
  "rating": 5,
  "comment": "Amazing movie! Loved every minute of it.",
  "spoilerAlert": false
}

Response:
{
  "success": true,
  "review": {
    "id": "review_id",
    "rating": 5,
    "comment": "Amazing movie! Loved every minute of it.",
    "user": { "name": "John Doe" },
    "createdAt": "2025-09-14T10:30:00Z"
  }
}
```

#### Add to Watchlist

```javascript
POST /api/users/:userId/watchlist
Authorization: Bearer TOKEN
{
  "movieId": "movie_id_here",
  "status": "want-to-watch",
  "priority": "high",
  "notes": "Recommended by friend"
}
```

### Error Handling

All API responses follow a consistent format:

**Success Response:**

```javascript
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**

```javascript
{
  "success": false,
  "message": "Error description",
  "error": "Error details"
}
```

**Common HTTP Status Codes:**

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 📁 Project Structure

```
Latracal_Solution_Assignment/
├── backend/
│   ├── controllers/          # Route controllers
│   ├── middleware/          # Custom middleware
│   │   ├── auth.js         # Authentication middleware
│   │   ├── validation.js   # Input validation
│   │   └── error.js        # Error handling
│   ├── models/             # Mongoose models
│   │   ├── User.js         # User model
│   │   ├── Movie.js        # Movie model
│   │   ├── Review.js       # Review model
│   │   └── Watchlist.js    # Watchlist model
│   ├── routes/             # API routes
│   │   ├── auth.js         # Authentication routes
│   │   ├── movies.js       # Movie routes
│   │   ├── reviews.js      # Review routes
│   │   ├── users.js        # User routes
│   │   └── watchlist.js    # Watchlist routes
│   ├── scripts/            # Database scripts
│   │   └── seedMovies.js   # Database seeding
│   ├── utils/              # Utility functions
│   ├── app.js              # Express app configuration
│   ├── server.js           # Server entry point
│   ├── package.json        # Dependencies
│   └── .env                # Environment variables
├── frontend/
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── common/
│   │   ├── context/        # React Context
│   │   │   ├── AuthContext.jsx
│   │   │   ├── MoviesContext.jsx
│   │   │   ├── AppContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/          # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Movies.jsx
│   │   │   ├── MovieDetails.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── Profile.jsx
│   │   ├── services/       # API services
│   │   │   └── api.js      # API integration
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utility functions
│   │   ├── styles/         # CSS files
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── test-connection.html # API testing page
│   ├── package.json
│   └── vite.config.js
├── docs/                   # Documentation
│   ├── API-Testing-Guide.md
│   ├── Quick-Test-Guide.md
│   └── CONNECTION-STATUS.md
├── README.md
└── .gitignore
```

## 🎨 Design Decisions

### Architecture Decisions

1. **Separation of Concerns**

   - Clear separation between frontend and backend
   - RESTful API design with consistent endpoints
   - Modular component structure

2. **Authentication Strategy**

   - JWT tokens for stateless authentication
   - Role-based access control (User/Admin)
   - Secure password hashing with bcryptjs

3. **Database Design**

   - MongoDB with Mongoose ODM for flexibility
   - Proper indexing for performance
   - Data validation at both frontend and backend

4. **State Management**
   - React Context API for global state
   - Separate contexts for auth, movies, and app state
   - Local state for component-specific data

### Security Implementations

1. **Input Validation**

   - Server-side validation with express-validator
   - Client-side validation for better UX
   - XSS protection through proper data sanitization

2. **Authentication & Authorization**

   - JWT tokens with expiration
   - Protected routes with middleware
   - Role-based access control

3. **Database Security**
   - MongoDB Atlas with network restrictions
   - Proper connection string handling
   - Data sanitization before database operations

### Performance Optimizations

1. **Database Indexing**

   - Indexed fields for faster queries
   - Compound indexes for complex searches
   - Unique indexes for data integrity

2. **API Optimization**

   - Pagination for large datasets
   - Selective field population
   - Caching strategies for static data

3. **Frontend Optimization**
   - Component memoization where needed
   - Lazy loading for routes
   - Optimized bundle size with Vite

### User Experience Decisions

1. **Responsive Design**

   - Mobile-first approach
   - Flexible layouts for all screen sizes
   - Touch-friendly interface elements

2. **Error Handling**

   - User-friendly error messages
   - Graceful fallbacks for failed requests
   - Loading states for better feedback

3. **Accessibility**
   - Semantic HTML structure
   - Proper ARIA labels
   - Keyboard navigation support

## 🧪 Testing

### Manual Testing

1. **API Testing with Postman**

   - Import the provided Postman collection
   - Test all endpoints with sample data
   - Verify authentication and authorization

2. **Frontend Testing**

   - Use the HTML test page (`test-connection.html`)
   - Test user registration and login
   - Verify movie operations and reviews

3. **End-to-end Testing**
   - Complete user journey testing
   - Cross-browser compatibility
   - Mobile responsiveness testing

### Test Data

The seeding script provides comprehensive test data:

- **10 Popular movies** with complete metadata
- **Admin user** for testing admin features
- **Sample genres** and cast information

### Postman Collection

Import the API testing collection:

1. Open Postman
2. Import → Link or Raw Text
3. Use the endpoints documentation above
4. Set environment variables for base URL and tokens

## 🚀 Deployment

### Backend Deployment (Node.js hosting)

1. **Environment Setup**

   - Set production environment variables
   - Configure MongoDB Atlas for production
   - Update CORS settings for production domain

2. **Deploy to Heroku/Railway/Vercel**

```bash
# Example for Heroku
heroku create your-app-name-backend
heroku config:set MONGODB_URI="your-production-connection-string"
heroku config:set JWT_SECRET="your-production-jwt-secret"
git subtree push --prefix backend heroku main
```

### Frontend Deployment (Static hosting)

1. **Build for Production**

```bash
cd frontend
npm run build
```

2. **Deploy to Netlify/Vercel**
   - Upload the `dist` folder
   - Configure environment variables
   - Set up redirects for client-side routing

### Environment-Specific Configurations

**Development:**

- Debug logging enabled
- CORS allows localhost
- Detailed error messages

**Production:**

- Minimal logging
- Restricted CORS origins
- Generic error messages
- HTTPS enforcement

## 🤝 Contributing

We welcome contributions to improve the Movie Review Platform! Please follow these guidelines:

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and ensure code quality
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Standards

- Follow ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features
- Test your changes thoroughly

### Areas for Contribution

- [ ] Unit and integration tests
- [ ] Performance optimizations
- [ ] Additional movie metadata
- [ ] Social features (following users)
- [ ] Email notifications
- [ ] Advanced search filters
- [ ] Movie recommendations
- [ ] API rate limiting
- [ ] Caching implementation

## 📞 Support

If you encounter any issues or have questions:

1. **Check the documentation** - Most common issues are covered
2. **Review the API testing guide** - Comprehensive endpoint testing
3. **Check the connection status** - Use the HTML test page
4. **Open an issue** - Provide detailed information about the problem

### Common Issues

1. **Node.js Version Error**

   - Solution: Update to Node.js v20.19+ or v22.12+

2. **MongoDB Connection Error**

   - Check MongoDB Atlas network access settings
   - Verify connection string in `.env`
   - Ensure database user has proper permissions

3. **CORS Errors**

   - Verify `FRONTEND_URL` in backend `.env`
   - Check backend is running on correct port

4. **Authentication Errors**
   - Ensure JWT_SECRET is set in `.env`
   - Check token format in Authorization header
   - Verify user exists and is active

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MongoDB Atlas** - Cloud database hosting
- **Vite** - Fast frontend build tool
- **Express.js** - Web framework for Node.js
- **React Team** - Frontend framework
- **JWT** - Authentication standard
- **Mongoose** - MongoDB object modeling

---

**Built with ❤️ by [Shaik Gafoor](https://github.com/shaik-gafoor)**

For the latest updates and releases, visit the [GitHub repository](https://github.com/shaik-gafoor/Latracal_Solution_Assignment).
