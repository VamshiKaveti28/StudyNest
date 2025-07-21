// src/services/reviewService.js
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";

// Add a review to a course
export const addReview = async (courseId, rating, comment) => {
  try {
    if (!auth.currentUser) {
      throw new Error("You must be logged in to leave a review");
    }

    // Check if user has already submitted a review for this course
    const existingReview = await getUserReviewForCourse(courseId);
    if (existingReview) {
      throw new Error("You have already reviewed this course");
    }

    // Check if user has enrolled in this course
    const enrollmentsRef = collection(db, "enrollments");
    const enrollmentQuery = query(
      enrollmentsRef,
      where("userId", "==", auth.currentUser.uid),
      where("courseId", "==", courseId)
    );
    const enrollmentSnapshot = await getDocs(enrollmentQuery);

    if (enrollmentSnapshot.empty) {
      throw new Error("You must be enrolled in this course to leave a review");
    }

    // Add the review
    const reviewData = {
      courseId,
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName || "Anonymous",
      userPhotoURL: auth.currentUser.photoURL || null,
      rating,
      comment,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "reviews"), reviewData);
    return { id: docRef.id, ...reviewData };
  } catch (error) {
    console.error("Error adding review:", error);
    throw error;
  }
};

// Get all reviews for a course - Simplified without orderBy
export const getCourseReviews = async (courseId) => {
  try {
    const reviewsRef = collection(db, "reviews");
    const q = query(
      reviewsRef,
      where("courseId", "==", courseId)
      // No orderBy to avoid index requirement
    );

    const querySnapshot = await getDocs(q);
    const reviews = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Format date - handle case when createdAt is still a timestamp or might be null
        createdAt: data.createdAt
          ? data.createdAt.toDate
            ? data.createdAt.toDate()
            : new Date(data.createdAt.seconds * 1000)
          : new Date(),
      };
    });

    // Sort in JavaScript instead of using Firestore's orderBy
    return reviews.sort((a, b) => {
      // Sort by most recent first
      return b.createdAt - a.createdAt;
    });
  } catch (error) {
    console.error("Error getting course reviews:", error);
    throw error;
  }
};

// Get the current user's review for a course (if exists)
export const getUserReviewForCourse = async (courseId) => {
  try {
    if (!auth.currentUser) return null;

    const reviewsRef = collection(db, "reviews");
    const q = query(
      reviewsRef,
      where("courseId", "==", courseId),
      where("userId", "==", auth.currentUser.uid)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const reviewDoc = querySnapshot.docs[0];
    const data = reviewDoc.data();

    return {
      id: reviewDoc.id,
      ...data,
      createdAt: data.createdAt
        ? data.createdAt.toDate
          ? data.createdAt.toDate()
          : new Date(data.createdAt.seconds * 1000)
        : new Date(),
    };
  } catch (error) {
    console.error("Error getting user review:", error);
    throw error;
  }
};

// Delete a review
export const deleteReview = async (reviewId) => {
  try {
    if (!auth.currentUser) {
      throw new Error("You must be logged in to delete a review");
    }

    const reviewRef = doc(db, "reviews", reviewId);
    const reviewSnap = await getDoc(reviewRef);

    if (!reviewSnap.exists()) {
      throw new Error("Review not found");
    }

    const reviewData = reviewSnap.data();

    if (reviewData.userId !== auth.currentUser.uid) {
      throw new Error("You can only delete your own reviews");
    }

    await deleteDoc(reviewRef);
    return true;
  } catch (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
};

// Get the average rating for a course
export const getCourseAverageRating = async (courseId) => {
  try {
    const reviews = await getCourseReviews(courseId);

    if (reviews.length === 0) {
      return { average: 0, count: 0 };
    }

    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    const average = sum / reviews.length;

    return {
      average: parseFloat(average.toFixed(1)),
      count: reviews.length,
    };
  } catch (error) {
    console.error("Error calculating average rating:", error);
    throw error;
  }
};
