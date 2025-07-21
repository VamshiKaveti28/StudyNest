// src/services/enrollmentService.js
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  increment,
  orderBy,
  limit,
} from "firebase/firestore";
import { db, auth } from "../firebase";

// Get all pending enrollments for instructor courses
export const getPendingEnrollments = async () => {
  try {
    if (!auth.currentUser) {
      throw new Error("You must be logged in to view enrollment requests");
    }

    // First, get all the instructor's courses
    const coursesRef = collection(db, "courses");
    const coursesQuery = query(
      coursesRef,
      where("instructorId", "==", auth.currentUser.uid)
    );
    const coursesSnapshot = await getDocs(coursesQuery);
    const courseIds = coursesSnapshot.docs.map((doc) => doc.id);

    if (courseIds.length === 0) {
      return [];
    }

    // Get all pending enrollments for these courses
    const enrollmentsRef = collection(db, "enrollments");
    const enrollmentsQuery = query(
      enrollmentsRef,
      where("courseId", "in", courseIds),
      where("status", "==", "pending")
    );
    const enrollmentsSnapshot = await getDocs(enrollmentsQuery);

    // Get user info for each enrollment
    const pendingEnrollments = await Promise.all(
      enrollmentsSnapshot.docs.map(async (doc) => {
        const enrollment = { id: doc.id, ...doc.data() };

        // Get user profile
        const userProfileRef = collection(db, "profiles");
        const userQuery = query(
          userProfileRef,
          where("userId", "==", enrollment.userId)
        );
        const userSnapshot = await getDocs(userQuery);

        // Get course info
        const courseDoc = coursesSnapshot.docs.find(
          (course) => course.id === enrollment.courseId
        );

        const userData = userSnapshot.empty ? {} : userSnapshot.docs[0].data();

        return {
          ...enrollment,
          user: {
            name: userData.name || "Unknown User",
            email: userData.email || "",
            id: enrollment.userId,
          },
          course: {
            title: courseDoc ? courseDoc.data().title : "Unknown Course",
            id: enrollment.courseId,
          },
        };
      })
    );

    return pendingEnrollments;
  } catch (error) {
    console.error("Error getting pending enrollments:", error);
    throw error;
  }
};

// Approve a pending enrollment
export const approveEnrollment = async (enrollmentId) => {
  try {
    if (!auth.currentUser) {
      throw new Error("You must be logged in to approve enrollments");
    }

    const enrollmentRef = doc(db, "enrollments", enrollmentId);
    const enrollmentSnap = await getDoc(enrollmentRef);

    if (!enrollmentSnap.exists()) {
      throw new Error("Enrollment not found");
    }

    const enrollment = enrollmentSnap.data();

    // Verify the instructor owns this course
    const courseRef = doc(db, "courses", enrollment.courseId);
    const courseSnap = await getDoc(courseRef);

    if (!courseSnap.exists()) {
      throw new Error("Course not found");
    }

    if (courseSnap.data().instructorId !== auth.currentUser.uid) {
      throw new Error(
        "You don't have permission to approve enrollments for this course"
      );
    }

    // Update enrollment status
    await updateDoc(enrollmentRef, {
      status: "approved",
      approvedAt: new Date(),
    });

    // Increment the course's enrollmentsCount
    await updateDoc(courseRef, {
      enrollmentsCount: increment(1),
    });

    return true;
  } catch (error) {
    console.error("Error approving enrollment:", error);
    throw error;
  }
};

// Reject a pending enrollment
export const rejectEnrollment = async (enrollmentId) => {
  try {
    if (!auth.currentUser) {
      throw new Error("You must be logged in to reject enrollments");
    }

    const enrollmentRef = doc(db, "enrollments", enrollmentId);
    const enrollmentSnap = await getDoc(enrollmentRef);

    if (!enrollmentSnap.exists()) {
      throw new Error("Enrollment not found");
    }

    const enrollment = enrollmentSnap.data();

    // Verify the instructor owns this course
    const courseRef = doc(db, "courses", enrollment.courseId);
    const courseSnap = await getDoc(courseRef);

    if (!courseSnap.exists()) {
      throw new Error("Course not found");
    }

    if (courseSnap.data().instructorId !== auth.currentUser.uid) {
      throw new Error(
        "You don't have permission to reject enrollments for this course"
      );
    }

    // Delete the enrollment
    await deleteDoc(enrollmentRef);

    return true;
  } catch (error) {
    console.error("Error rejecting enrollment:", error);
    throw error;
  }
};

// Check if a course has reached its enrollment limit
export const checkEnrollmentLimit = async (courseId) => {
  try {
    // Get course details
    const courseRef = doc(db, "courses", courseId);
    const courseSnap = await getDoc(courseRef);

    if (!courseSnap.exists()) {
      throw new Error("Course not found");
    }

    const course = courseSnap.data();

    // If there's no enrollment limit, return false (not reached)
    if (!course.enrollmentLimit || course.enrollmentLimit <= 0) {
      return false;
    }

    // Count approved enrollments
    const enrollmentsRef = collection(db, "enrollments");
    const approvedQuery = query(
      enrollmentsRef,
      where("courseId", "==", courseId),
      where("status", "==", "approved")
    );

    const pendingQuery = query(
      enrollmentsRef,
      where("courseId", "==", courseId),
      where("status", "==", "pending")
    );

    const [approvedSnapshot, pendingSnapshot] = await Promise.all([
      getDocs(approvedQuery),
      getDocs(pendingQuery),
    ]);

    const totalEnrollments = approvedSnapshot.size + pendingSnapshot.size;

    // Check if limit reached
    return totalEnrollments >= course.enrollmentLimit;
  } catch (error) {
    console.error("Error checking enrollment limit:", error);
    throw error;
  }
};
