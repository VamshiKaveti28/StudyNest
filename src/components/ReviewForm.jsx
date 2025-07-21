// src/components/ReviewForm.jsx
import React, { useState } from "react";
import StarRating from "./StarRating";
import Button from "./common/Button";
import { addReview } from "../services/reviewService";
import { useAuth } from "../contexts/AuthContext";

const ReviewForm = ({ courseId, onReviewAdded, userHasReviewed }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      setError("You must be logged in to leave a review");
      return;
    }

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (comment.trim() === "") {
      setError("Please add a comment with your review");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const review = await addReview(courseId, rating, comment);
      onReviewAdded(review);
      setRating(0);
      setComment("");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (userHasReviewed) {
    return (
      <div className="bg-blue-50 rounded-lg p-4 text-blue-800">
        You've already submitted a review for this course.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Write a Review</h3>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Your Rating
          </label>
          <StarRating
            rating={rating}
            size="lg"
            interactive={true}
            onRatingChange={setRating}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="comment"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Your Review
          </label>
          <textarea
            id="comment"
            rows="4"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Share your experience with this course..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          ></textarea>
        </div>

        <div className="flex items-center justify-end">
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
