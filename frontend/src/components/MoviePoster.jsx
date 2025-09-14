import React, { useState } from "react";
import { getPosterUrl } from "../utils/posterUrls";

const MoviePoster = ({ title, src, alt, className = "movie-poster" }) => {
  const [imageError, setImageError] = useState(false);

  // Get reliable poster URL
  const posterUrl = getPosterUrl(title, src);

  // Create a simple colored placeholder based on movie title
  const generatePlaceholder = (title) => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FECA57",
      "#FF9FF3",
      "#54A0FF",
      "#5F27CD",
    ];
    const colorIndex =
      title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length;
    const color = colors[colorIndex];

    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${color}"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-family="Arial, sans-serif" font-size="18" font-weight="bold">
          ${title}
        </text>
      </svg>
    `)}`;
  };

  // Get image source - show poster immediately, fallback on error
  const getImageSrc = () => {
    if (imageError || !posterUrl) {
      return generatePlaceholder(title);
    }
    // Convert HTTP to HTTPS for better compatibility
    return posterUrl.replace(/^http:/, "https:");
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <img
      src={getImageSrc()}
      alt={alt || title}
      className={className}
      onError={handleImageError}
      loading="lazy"
    />
  );
};

export default MoviePoster;
