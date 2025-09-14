import mongoose from "mongoose";
import dotenv from "dotenv";
import { Movie, User } from "../models/index.js";

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected for seeding...");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

const sampleMovies = [
  {
    title: "The Shawshank Redemption",
    genre: ["Drama"],
    releaseYear: 1994,
    director: "Frank Darabont",
    cast: [
      { name: "Tim Robbins", role: "Andy Dufresne" },
      { name: "Morgan Freeman", role: "Ellis Boyd 'Red' Redding" },
    ],
    synopsis:
      "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg",
    duration: 142,
    language: "English",
    country: "USA",
    rating: {
      imdbRating: 9.3,
    },
  },
  {
    title: "The Dark Knight",
    genre: ["Action", "Crime", "Drama"],
    releaseYear: 2008,
    director: "Christopher Nolan",
    cast: [
      { name: "Christian Bale", role: "Bruce Wayne / Batman" },
      { name: "Heath Ledger", role: "The Joker" },
    ],
    synopsis:
      "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg",
    duration: 152,
    language: "English",
    country: "USA",
    rating: {
      imdbRating: 9.0,
    },
  },
  {
    title: "Pulp Fiction",
    genre: ["Crime", "Drama"],
    releaseYear: 1994,
    director: "Quentin Tarantino",
    cast: [
      { name: "John Travolta", role: "Vincent Vega" },
      { name: "Samuel L. Jackson", role: "Jules Winnfield" },
    ],
    synopsis:
      "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
    duration: 154,
    language: "English",
    country: "USA",
    rating: {
      imdbRating: 8.9,
    },
  },
  {
    title: "The Lord of the Rings: The Fellowship of the Ring",
    genre: ["Adventure", "Drama", "Fantasy"],
    releaseYear: 2001,
    director: "Peter Jackson",
    cast: [
      { name: "Elijah Wood", role: "Frodo Baggins" },
      { name: "Ian McKellen", role: "Gandalf" },
    ],
    synopsis:
      "A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BN2EyZjM3NzUtNWUzMi00MTgxLWI0NTctMzY4M2VlOTdjZWRiXkEyXkFqcGdeQXVyNDUzOTQ5MjY@._V1_SX300.jpg",
    duration: 178,
    language: "English",
    country: "New Zealand",
    rating: {
      imdbRating: 8.8,
    },
  },
  {
    title: "Forrest Gump",
    genre: ["Drama", "Romance"],
    releaseYear: 1994,
    director: "Robert Zemeckis",
    cast: [
      { name: "Tom Hanks", role: "Forrest Gump" },
      { name: "Robin Wright", role: "Jenny Curran" },
    ],
    synopsis:
      "The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75.",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    duration: 142,
    language: "English",
    country: "USA",
    rating: {
      imdbRating: 8.8,
    },
  },
  {
    title: "Inception",
    genre: ["Action", "Sci-Fi", "Thriller"],
    releaseYear: 2010,
    director: "Christopher Nolan",
    cast: [
      { name: "Leonardo DiCaprio", role: "Dom Cobb" },
      { name: "Marion Cotillard", role: "Mal" },
    ],
    synopsis:
      "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    duration: 148,
    language: "English",
    country: "USA",
    rating: {
      imdbRating: 8.8,
    },
  },
  {
    title: "The Matrix",
    genre: ["Action", "Sci-Fi"],
    releaseYear: 1999,
    director: "The Wachowskis",
    cast: [
      { name: "Keanu Reeves", role: "Neo" },
      { name: "Laurence Fishburne", role: "Morpheus" },
    ],
    synopsis:
      "A computer programmer is led to fight an underground war against powerful computers who have constructed his entire reality with a system called the Matrix.",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
    duration: 136,
    language: "English",
    country: "USA",
    rating: {
      imdbRating: 8.7,
    },
  },
  {
    title: "Goodfellas",
    genre: ["Crime", "Drama"],
    releaseYear: 1990,
    director: "Martin Scorsese",
    cast: [
      { name: "Robert De Niro", role: "James Conway" },
      { name: "Ray Liotta", role: "Henry Hill" },
    ],
    synopsis:
      "The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners Jimmy Conway and Tommy DeVito.",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BY2NkZjEzMDgtN2RjYy00YzM1LWI4ZmQtMjA0Y2Y3ZGI1ZGFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
    duration: 146,
    language: "English",
    country: "USA",
    rating: {
      imdbRating: 8.7,
    },
  },
  {
    title: "The Godfather",
    genre: ["Crime", "Drama"],
    releaseYear: 1972,
    director: "Francis Ford Coppola",
    cast: [
      { name: "Marlon Brando", role: "Don Vito Corleone" },
      { name: "Al Pacino", role: "Michael Corleone" },
    ],
    synopsis:
      "An organized crime dynasty's aging patriarch transfers control of his clandestine empire to his reluctant son.",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
    duration: 175,
    language: "English",
    country: "USA",
    rating: {
      imdbRating: 9.2,
    },
  },
  {
    title: "Interstellar",
    genre: ["Adventure", "Drama", "Sci-Fi"],
    releaseYear: 2014,
    director: "Christopher Nolan",
    cast: [
      { name: "Matthew McConaughey", role: "Cooper" },
      { name: "Anne Hathaway", role: "Brand" },
    ],
    synopsis:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg",
    duration: 169,
    language: "English",
    country: "USA",
    rating: {
      imdbRating: 8.6,
    },
  },
];

const seedMovies = async () => {
  try {
    // Create a default admin user first
    const adminUser = await User.findOne({ email: "admin@moviereview.com" });
    let adminUserId;

    if (!adminUser) {
      const newAdmin = await User.create({
        username: "admin",
        email: "admin@moviereview.com",
        password: "Admin123!",
        isAdmin: true,
        bio: "System Administrator",
      });
      adminUserId = newAdmin._id;
      console.log("Created admin user");
    } else {
      adminUserId = adminUser._id;
      console.log("Using existing admin user");
    }

    // Clear existing movies
    await Movie.deleteMany({});
    console.log("Cleared existing movies");

    // Add addedBy field to each movie
    const moviesWithAdmin = sampleMovies.map((movie) => ({
      ...movie,
      addedBy: adminUserId,
    }));

    // Insert sample movies
    const insertedMovies = await Movie.insertMany(moviesWithAdmin);
    console.log(`Successfully inserted ${insertedMovies.length} movies`);

    // Display inserted movies
    insertedMovies.forEach((movie) => {
      console.log(`- ${movie.title} (${movie.releaseYear})`);
    });

    console.log("\nDatabase seeded successfully!");
    console.log("\nYou can now:");
    console.log("1. Register a new user account");
    console.log("2. Browse the seeded movies");
    console.log("3. Add reviews to movies");
    console.log("4. Add movies to your watchlist");
    console.log("\nAdmin credentials:");
    console.log("Email: admin@moviereview.com");
    console.log("Password: Admin123!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seed function
connectDB().then(() => {
  seedMovies();
});
