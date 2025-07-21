// src/components/StarRating.jsx
import React from "react";
import { Star } from "lucide-react";

// This component can be used for both displaying ratings and selecting ratings
const StarRating = ({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange = () => {},
}) => {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const selectedClass = "text-yellow-400 fill-yellow-400";
  const unselectedClass = "text-gray-300";
  const hoverClass = interactive
    ? "cursor-pointer hover:scale-110 transition-transform"
    : "";

  const handleClick = (selectedRating) => {
    if (interactive) {
      onRatingChange(selectedRating);
    }
  };

  return (
    <div className="flex">
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        return (
          <Star
            key={index}
            className={`${sizeClasses[size]} ${
              starValue <= rating ? selectedClass : unselectedClass
            } ${hoverClass} mr-0.5`}
            onClick={() => handleClick(starValue)}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
