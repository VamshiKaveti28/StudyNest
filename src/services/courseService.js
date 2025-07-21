// src/services/courseService.js
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  addDoc,
  updateDoc,
  arrayUnion,
  increment,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { checkEnrollmentLimit } from "./enrollmentService";

export const getCertificateId = async (userId, courseId) => {
  try {
    // Check if a certificate already exists for this user and course
    const certificatesRef = collection(db, "certificates");
    const q = query(
      certificatesRef,
      where("userId", "==", userId),
      where("courseId", "==", courseId)
    );

    const querySnapshot = await getDocs(q);

    // If certificate exists, return its ID
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data().certificateId;
    }

    // Otherwise generate a new one and store it
    const newCertificateId = `NN-${courseId
      .slice(0, 4)
      .toUpperCase()}-${userId.slice(0, 4)}-${Math.floor(Date.now() / 1000)
      .toString()
      .padStart(8, "0")}`;

    // Store the new certificate ID
    await addDoc(certificatesRef, {
      userId,
      courseId,
      certificateId: newCertificateId,
      issueDate: serverTimestamp(),
    });

    return newCertificateId;
  } catch (error) {
    console.error("Error managing certificate ID:", error);
    throw error;
  }
};

// Get all published courses
export const getAllCourses = async () => {
  try {
    const coursesCollection = collection(db, "courses");

    // Only get published courses for regular users
    const coursesQuery = query(
      coursesCollection,
      where("published", "==", true)
    );

    const coursesSnapshot = await getDocs(coursesQuery);
    return coursesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting courses:", error);
    throw error;
  }
};

// Get course by ID - Updated to remove the instructor check
// so it works both for instructors and students
export const getCourseById = async (courseId) => {
  try {
    const courseDoc = await getDoc(doc(db, "courses", courseId));
    if (courseDoc.exists()) {
      return {
        id: courseDoc.id,
        ...courseDoc.data(),
      };
    } else {
      throw new Error("Course not found");
    }
  } catch (error) {
    console.error("Error getting course:", error);
    throw error;
  }
};

// Get lessons for a course in correct order
export const getCourseLessons = async (courseId) => {
  try {
    const lessonsCollection = collection(db, "lessons");
    const q = query(
      lessonsCollection,
      where("courseId", "==", courseId),
      orderBy("order")
    );

    const lessonsSnapshot = await getDocs(q);
    return lessonsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting lessons:", error);
    throw error;
  }
};

// Check if user is enrolled in a course
export const isUserEnrolled = async (courseId) => {
  try {
    if (!auth.currentUser) return false;

    const enrollmentsCollection = collection(db, "enrollments");
    const q = query(
      enrollmentsCollection,
      where("userId", "==", auth.currentUser.uid),
      where("courseId", "==", courseId)
    );

    const enrollmentsSnapshot = await getDocs(q);

    if (enrollmentsSnapshot.empty) {
      return false;
    }

    // Check if enrollment is approved (if course requires approval)
    const enrollment = enrollmentsSnapshot.docs[0].data();
    const course = await getCourseById(courseId);

    if (course.requiresApproval) {
      return enrollment.status === "approved";
    }

    return true;
  } catch (error) {
    console.error("Error checking enrollment:", error);
    throw error;
  }
};

// Get enrollment status for a course
export const getEnrollmentStatus = async (courseId) => {
  try {
    if (!auth.currentUser) return null;

    const enrollmentsCollection = collection(db, "enrollments");
    const q = query(
      enrollmentsCollection,
      where("userId", "==", auth.currentUser.uid),
      where("courseId", "==", courseId)
    );

    const enrollmentsSnapshot = await getDocs(q);

    if (enrollmentsSnapshot.empty) {
      return null;
    }

    const enrollment = enrollmentsSnapshot.docs[0].data();
    return enrollment.status;
  } catch (error) {
    console.error("Error getting enrollment status:", error);
    throw error;
  }
};

// Enroll user in a course
export const enrollInCourse = async (courseId) => {
  try {
    if (!auth.currentUser) throw new Error("User not authenticated");

    // Check if already enrolled
    const enrollmentStatus = await getEnrollmentStatus(courseId);
    if (enrollmentStatus === "approved") {
      return { success: true, status: "already-enrolled" };
    }
    if (enrollmentStatus === "pending") {
      return { success: true, status: "pending-approval" };
    }

    // Get course details
    const course = await getCourseById(courseId);

    // Check enrollment limit
    if (course.enrollmentLimit && course.enrollmentLimit > 0) {
      const limitReached = await checkEnrollmentLimit(courseId);
      if (limitReached) {
        throw new Error("This course has reached its enrollment limit");
      }
    }

    // Determine status based on course settings
    const status = course.requiresApproval ? "pending" : "approved";

    // Add to enrollments collection
    await addDoc(collection(db, "enrollments"), {
      userId: auth.currentUser.uid,
      courseId: courseId,
      enrolledAt: serverTimestamp(),
      progress: 0,
      completedLessons: [],
      status: status,
    });

    // Only increment enrollments count if auto-approved
    if (!course.requiresApproval) {
      // Increment enrollments count in course
      const courseRef = doc(db, "courses", courseId);
      await updateDoc(courseRef, {
        enrollmentsCount: increment(1),
      });
    }

    return {
      success: true,
      status: status,
    };
  } catch (error) {
    console.error("Error enrolling in course:", error);
    throw error;
  }
};

// Update user progress in a course when a lesson is completed - Fixed to handle exactly 100% progress
export const updateLessonProgress = async (courseId, lessonId, completed) => {
  try {
    if (!auth.currentUser) throw new Error("User not authenticated");

    const enrollmentsCollection = collection(db, "enrollments");
    const q = query(
      enrollmentsCollection,
      where("userId", "==", auth.currentUser.uid),
      where("courseId", "==", courseId)
    );

    const enrollmentsSnapshot = await getDocs(q);

    if (enrollmentsSnapshot.empty) {
      throw new Error("User not enrolled in this course");
    }

    // Check if enrollment is approved
    const enrollment = enrollmentsSnapshot.docs[0].data();
    if (enrollment.status !== "approved") {
      throw new Error("Enrollment is not approved yet");
    }

    const enrollmentId = enrollmentsSnapshot.docs[0].id;
    const enrollmentRef = doc(db, "enrollments", enrollmentId);

    // Only add to completedLessons if it's not already completed
    if (completed && !enrollment.completedLessons?.includes(lessonId)) {
      await updateDoc(enrollmentRef, {
        completedLessons: arrayUnion(lessonId),
      });
    }

    // Get all lessons to calculate progress
    const lessons = await getCourseLessons(courseId);

    // Make sure completedLessons is an array (handle null/undefined case)
    const currentCompletedLessons = enrollment.completedLessons || [];

    const completedLessons = completed
      ? [...new Set([...currentCompletedLessons, lessonId])] // Use Set to ensure uniqueness
      : currentCompletedLessons;

    // Calculate progress as percentage, rounded to nearest integer
    const progress =
      lessons.length > 0
        ? Math.round((completedLessons.length / lessons.length) * 100)
        : 0;

    // If all lessons are completed, make sure progress is exactly 100
    const updatedProgress =
      completedLessons.length === lessons.length && lessons.length > 0
        ? 100
        : progress;

    await updateDoc(enrollmentRef, {
      progress: updatedProgress,
    });

    return updatedProgress;
  } catch (error) {
    console.error("Error updating lesson progress:", error);
    throw error;
  }
};

// Get user progress for a course
export const getUserCourseProgress = async (courseId) => {
  try {
    if (!auth.currentUser) return null;

    const enrollmentsCollection = collection(db, "enrollments");
    const q = query(
      enrollmentsCollection,
      where("userId", "==", auth.currentUser.uid),
      where("courseId", "==", courseId)
    );

    const enrollmentsSnapshot = await getDocs(q);

    if (enrollmentsSnapshot.empty) {
      return null;
    }

    return enrollmentsSnapshot.docs[0].data();
  } catch (error) {
    console.error("Error getting user progress:", error);
    throw error;
  }
};

// Get all courses a user is enrolled in
export const getUserEnrolledCourses = async () => {
  try {
    if (!auth.currentUser) return [];

    const enrollmentsCollection = collection(db, "enrollments");
    const q = query(
      enrollmentsCollection,
      where("userId", "==", auth.currentUser.uid)
    );

    const enrollmentsSnapshot = await getDocs(q);

    const enrollments = enrollmentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get course details for each enrollment
    const coursesWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        try {
          const course = await getCourseById(enrollment.courseId);
          return {
            ...course,
            progress: enrollment.progress,
            completedLessons: enrollment.completedLessons,
            enrolledAt: enrollment.enrolledAt,
            status: enrollment.status,
          };
        } catch (error) {
          console.error(`Error fetching course ${enrollment.courseId}:`, error);
          // Return a minimal object with the enrollment data if course fetch fails
          return {
            id: enrollment.courseId,
            title: "Unavailable Course",
            progress: enrollment.progress,
            completedLessons: enrollment.completedLessons,
            enrolledAt: enrollment.enrolledAt,
            status: enrollment.status,
          };
        }
      })
    );

    return coursesWithProgress;
  } catch (error) {
    console.error("Error getting user's enrolled courses:", error);
    throw error;
  }
};

// Get courses by category
export const getCoursesByCategory = async (category) => {
  try {
    const coursesCollection = collection(db, "courses");
    const q = query(
      coursesCollection,
      where("category", "==", category),
      where("published", "==", true)
    );

    const coursesSnapshot = await getDocs(q);
    return coursesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting courses by category:", error);
    throw error;
  }
};

// Get courses by level
export const getCoursesByLevel = async (level) => {
  try {
    const coursesCollection = collection(db, "courses");
    const q = query(
      coursesCollection,
      where("level", "==", level),
      where("published", "==", true)
    );

    const coursesSnapshot = await getDocs(q);
    return coursesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting courses by level:", error);
    throw error;
  }
};
