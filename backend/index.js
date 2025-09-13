import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Movie Review Platform API");
});

// TODO: Add routes for movies, users, reviews, watchlist

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
