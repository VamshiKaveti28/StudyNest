// src/components/ReviewItem.jsx
import React from "react";
import { Trash2 } from "lucide-react";
import StarRating from "./StarRating";
import { deleteReview } from "../services/reviewService";
import { useAuth } from "../contexts/AuthContext";

const ReviewItem = ({ review, onDelete }) => {
  const { currentUser } = useAuth();
  const isUserReview = currentUser && currentUser.uid === review.userId;

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDelete = async () => {
    try {
      if (window.confirm("Are you sure you want to delete this review?")) {
        await deleteReview(review.id);
        onDelete(review.id);
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-white">
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-4">
          {review.userPhotoURL ? (
            <img
              src={review.userPhotoURL}
              alt={review.userName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
              {getInitials(review.userName)}
            </div>
          )}
        </div>

        <div className="flex-grow">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-gray-800">{review.userName}</h4>
              <div className="flex items-center">
                <StarRating rating={review.rating} size="sm" />
                <span className="ml-2 text-xs text-gray-500">
                  {formatDate(review.createdAt)}
                </span>
              </div>
            </div>

            {isUserReview && (
              <button
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700"
                aria-label="Delete review"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          <p className="mt-2 text-gray-600">{review.comment}</p>
        </div>
      </div>
    </div>
  );
};

export default ReviewItem;
