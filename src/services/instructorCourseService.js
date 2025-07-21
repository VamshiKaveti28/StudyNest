// src/services/instructorCourseService.js
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { db, auth } from "../firebase";

// Create a new course
export const createCourse = async (courseData) => {
  try {
    if (!auth.currentUser) {
      throw new Error("You must be logged in to create a course");
    }

    const courseWithMetadata = {
      ...courseData,
      instructorId: auth.currentUser.uid,
      instructorEmail: auth.currentUser.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      enrollmentsCount: 0,
      published: false, // By default, courses are not published
    };

    const docRef = await addDoc(collection(db, "courses"), courseWithMetadata);

    // Return the new course with its ID
    return {
      id: docRef.id,
      ...courseWithMetadata,
      createdAt: new Date(), // Convert serverTimestamp to JS Date for frontend use
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error("Error creating course:", error);
    throw error;
  }
};

// Get all courses for the current instructor
export const getInstructorCourses = async () => {
  try {
    if (!auth.currentUser) {
      throw new Error("You must be logged in to view your courses");
    }

    const coursesCollection = collection(db, "courses");
    const q = query(
      coursesCollection,
      where("instructorId", "==", auth.currentUser.uid)
    );
    const coursesSnapshot = await getDocs(q);

    return coursesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting instructor courses:", error);
    throw error;
  }
};

// Get a specific course by ID
export const getCourseById = async (courseId) => {
  try {
    const courseDoc = await getDoc(doc(db, "courses", courseId));
    if (courseDoc.exists()) {
      const courseData = courseDoc.data();

      // Verify that this is the instructor's course
      if (
        auth.currentUser &&
        courseData.instructorId === auth.currentUser.uid
      ) {
        return {
          id: courseDoc.id,
          ...courseData,
        };
      } else {
        throw new Error("You don't have access to this course");
      }
    } else {
      throw new Error("Course not found");
    }
  } catch (error) {
    console.error("Error getting course:", error);
    throw error;
  }
};

// Add a lesson to a course
export const addLessonToCourse = async (courseId, lessonData) => {
  try {
    if (!auth.currentUser) {
      throw new Error("You must be logged in to add a lesson");
    }

    // Ensure courseId is explicitly set in the lesson data
    const lessonWithMetadata = {
      ...lessonData,
      courseId, // Make sure courseId is included
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "lessons"), lessonWithMetadata);

    // Return the new lesson with its ID
    return {
      id: docRef.id,
      ...lessonWithMetadata,
      createdAt: new Date(), // Convert serverTimestamp to JS Date for frontend use
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error("Error adding lesson:", error);
    throw error;
  }
};

// Get all lessons for a specific course
export const getCourseLessons = async (courseId) => {
  try {
    const lessonsCollection = collection(db, "lessons");
    const q = query(
      lessonsCollection,
      where("courseId", "==", courseId),
      orderBy("order") // Order by the lesson order
    );

    const lessonsSnapshot = await getDocs(q);

    return lessonsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting course lessons:", error);
    throw error;
  }
};

// Update a lesson
export const updateLesson = async (lessonId, lessonData) => {
  try {
    if (!auth.currentUser) {
      throw new Error("You must be logged in to update a lesson");
    }

    const lessonRef = doc(db, "lessons", lessonId);

    await updateDoc(lessonRef, {
      ...lessonData,
      updatedAt: serverTimestamp(),
    });

    return { id: lessonId, ...lessonData };
  } catch (error) {
    console.error("Error updating lesson:", error);
    throw error;
  }
};

// Update course details
export const updateCourse = async (courseId, courseData) => {
  try {
    if (!auth.currentUser) {
      throw new Error("You must be logged in to update a course");
    }

    const courseRef = doc(db, "courses", courseId);

    // Verify ownership
    const courseSnap = await getDoc(courseRef);
    if (!courseSnap.exists()) {
      throw new Error("Course not found");
    }

    const courseInfo = courseSnap.data();
    if (courseInfo.instructorId !== auth.currentUser.uid) {
      throw new Error("You don't have permission to update this course");
    }

    await updateDoc(courseRef, {
      ...courseData,
      updatedAt: serverTimestamp(),
    });

    return { id: courseId, ...courseData };
  } catch (error) {
    console.error("Error updating course:", error);
    throw error;
  }
};

// Delete a course and all its lessons
export const deleteCourse = async (courseId) => {
  try {
    if (!auth.currentUser) {
      throw new Error("You must be logged in to delete a course");
    }

    // First, get all lessons associated with this course to delete them
    const lessonsCollection = collection(db, "lessons");
    const q = query(lessonsCollection, where("courseId", "==", courseId));
    const lessonsSnapshot = await getDocs(q);

    // Delete each lesson
    const deleteLessonsPromises = lessonsSnapshot.docs.map((lessonDoc) =>
      deleteDoc(doc(db, "lessons", lessonDoc.id))
    );

    await Promise.all(deleteLessonsPromises);

    // Then delete the course
    await deleteDoc(doc(db, "courses", courseId));

    return true;
  } catch (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
};

// Delete a specific lesson
export const deleteLesson = async (lessonId) => {
  try {
    if (!auth.currentUser) {
      throw new Error("You must be logged in to delete a lesson");
    }

    await deleteDoc(doc(db, "lessons", lessonId));
    return true;
  } catch (error) {
    console.error("Error deleting lesson:", error);
    throw error;
  }
};

// Publish or unpublish a course
export const toggleCoursePublishStatus = async (courseId, publishStatus) => {
  try {
    if (!auth.currentUser) {
      throw new Error("You must be logged in to publish/unpublish a course");
    }

    const courseRef = doc(db, "courses", courseId);

    await updateDoc(courseRef, {
      published: publishStatus,
      updatedAt: serverTimestamp(),
    });

    return { published: publishStatus };
  } catch (error) {
    console.error("Error toggling course publish status:", error);
    throw error;
  }
};
