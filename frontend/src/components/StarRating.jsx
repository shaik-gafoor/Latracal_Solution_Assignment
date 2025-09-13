import React, { useState } from "react";

const StarRating = ({
  rating = 0,
  onRatingChange,
  readOnly = false,
  size = "medium",
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    small: "text-sm",
    medium: "text-lg",
    large: "text-2xl",
  };

  const handleClick = (newRating) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(newRating);
    }
  };

  const handleMouseEnter = (newRating) => {
    if (!readOnly) {
      setHoverRating(newRating);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hoverRating || rating);
        return (
          <button
            key={star}
            type="button"
            className={`star-button ${isFilled ? "active" : ""} ${
              sizeClasses[size]
            }`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            disabled={readOnly}
            style={{ cursor: readOnly ? "default" : "pointer" }}
          >
            ★
          </button>
        );
      })}
      {rating > 0 && <span className="rating-text ml-2">{rating}/5 stars</span>}
    </div>
  );
};

export default StarRating;
