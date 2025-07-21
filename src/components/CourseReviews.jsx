// src/components/CourseReviews.jsx
import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import ReviewItem from "./ReviewItem";
import ReviewForm from "./ReviewForm";
import {
  getCourseReviews,
  getCourseAverageRating,
  getUserReviewForCourse,
} from "../services/reviewService";
import { useAuth } from "../contexts/AuthContext";

const CourseReviews = ({ courseId, isEnrolled }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userReview, setUserReview] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchData();
  }, [courseId, currentUser]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Get reviews
      const reviewsData = await getCourseReviews(courseId);
      setReviews(reviewsData);

      // Get average rating
      const ratingData = await getCourseAverageRating(courseId);
      setAverageRating(ratingData);

      // Check if user has already reviewed
      if (currentUser) {
        const userReviewData = await getUserReviewForCourse(courseId);
        setUserReview(userReviewData);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAdded = (newReview) => {
    setReviews((prevReviews) => [newReview, ...prevReviews]);
    setUserReview(newReview);
    // Update the average rating
    fetchData();
  };

  const handleReviewDeleted = (reviewId) => {
    setReviews((prevReviews) =>
      prevReviews.filter((review) => review.id !== reviewId)
    );
    if (userReview && userReview.id === reviewId) {
      setUserReview(null);
    }
    // Update the average rating
    fetchData();
  };

  // Get the distribution of ratings (for the rating bars)
  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0]; // 5 stars, 4 stars, 3 stars, 2 stars, 1 star

    reviews.forEach((review) => {
      const ratingIndex = Math.floor(review.rating) - 1;
      if (ratingIndex >= 0 && ratingIndex < 5) {
        distribution[ratingIndex]++;
      }
    });

    return distribution.reverse(); // Reverse to show 5 stars first
  };

  const distribution = getRatingDistribution();
  const totalReviews = reviews.length;

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Student Reviews</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Rating Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
            <div className="flex flex-col md:flex-row items-start md:items-center">
              {/* Average rating */}
              <div className="flex-shrink-0 flex flex-col items-center pr-6 mb-4 md:mb-0 border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pb-0">
                <div className="text-5xl font-bold text-gray-800 mb-2">
                  {averageRating.average.toFixed(1)}
                </div>
                <div className="flex items-center mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={
                        i < Math.floor(averageRating.average)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-500">
                  {averageRating.count}{" "}
                  {averageRating.count === 1 ? "review" : "reviews"}
                </div>
              </div>

              {/* Rating breakdown */}
              <div className="flex-grow md:pl-6 w-full md:w-auto">
                {[5, 4, 3, 2, 1].map((star, index) => {
                  const count = distribution[index];
                  const percentage =
                    totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                  return (
                    <div key={star} className="flex items-center mb-1">
                      <div className="w-10 text-sm text-gray-600 flex items-center">
                        {star}{" "}
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 ml-1" />
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mx-2">
                        <div
                          className="bg-yellow-400 h-2.5 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="w-10 text-sm text-gray-600 text-right">
                        {count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Review Form (if user is enrolled) */}
          {isEnrolled && currentUser && (
            <div className="mb-8">
              <ReviewForm
                courseId={courseId}
                onReviewAdded={handleReviewAdded}
                userHasReviewed={!!userReview}
              />
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-600">
                  No reviews yet. Be the first to review this course!
                </p>
              </div>
            ) : (
              reviews.map((review) => (
                <ReviewItem
                  key={review.id}
                  review={review}
                  onDelete={handleReviewDeleted}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CourseReviews;
