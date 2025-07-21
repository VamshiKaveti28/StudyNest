// src/components/instructor/InstructorStudents.jsx
import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { Users } from "lucide-react";

const InstructorStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);

        // Get instructor's courses
        const coursesQuery = query(
          collection(db, "courses"),
          where("instructorId", "==", auth.currentUser.uid)
        );
        const coursesSnapshot = await getDocs(coursesQuery);
        const courseIds = coursesSnapshot.docs.map((doc) => doc.id);

        if (courseIds.length === 0) {
          setStudents([]);
          setLoading(false);
          return;
        }

        // Get enrollments for these courses
        const enrollmentsQuery = query(
          collection(db, "enrollments"),
          where("courseId", "in", courseIds)
        );
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);

        // Extract unique student IDs
        const studentIds = [
          ...new Set(enrollmentsSnapshot.docs.map((doc) => doc.data().userId)),
        ];

        // Get student profiles
        const studentData = [];
        for (const studentId of studentIds) {
          // Get user enrollments (which courses they're enrolled in)
          const userEnrollmentsQuery = query(
            collection(db, "enrollments"),
            where("userId", "==", studentId),
            where("courseId", "in", courseIds)
          );
          const userEnrollmentsSnapshot = await getDocs(userEnrollmentsQuery);

          // Get user profile
          const userProfileQuery = query(
            collection(db, "profiles"),
            where("userId", "==", studentId)
          );
          const userProfileSnapshot = await getDocs(userProfileQuery);

          if (!userProfileSnapshot.empty) {
            const profileData = userProfileSnapshot.docs[0].data();

            // Add to students array with enrollment info
            studentData.push({
              id: studentId,
              name: profileData.name || "Unknown",
              email: profileData.email || "",
              enrolledCourses: userEnrollmentsSnapshot.docs.map((doc) => {
                const courseDoc = coursesSnapshot.docs.find(
                  (courseDoc) => courseDoc.id === doc.data().courseId
                );
                return {
                  id: doc.data().courseId,
                  title: courseDoc ? courseDoc.data().title : "Unknown Course",
                  progress: doc.data().progress || 0,
                  enrolledAt: doc.data().enrolledAt
                    ? new Date(doc.data().enrolledAt.seconds * 1000)
                    : null,
                };
              }),
            });
          }
        }

        setStudents(studentData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching students:", error);
        setError("Failed to load student data");
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Students</h2>

      {students.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">
            No students are enrolled in your courses yet.
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Student
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Enrolled Courses
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Average Progress
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Last Enrollment
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => {
                // Calculate average progress across all courses
                const avgProgress =
                  student.enrolledCourses.length > 0
                    ? student.enrolledCourses.reduce(
                        (sum, course) => sum + course.progress,
                        0
                      ) / student.enrolledCourses.length
                    : 0;

                // Find most recent enrollment
                const lastEnrollment =
                  student.enrolledCourses.length > 0
                    ? student.enrolledCourses.reduce(
                        (latest, course) =>
                          !latest.enrolledAt ||
                          (course.enrolledAt &&
                            course.enrolledAt > latest.enrolledAt)
                            ? course
                            : latest,
                        student.enrolledCourses[0]
                      )
                    : null;

                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {student.enrolledCourses.length}
                      </div>
                      <div className="text-xs text-gray-500">
                        {student.enrolledCourses
                          .slice(0, 2)
                          .map((course) => course.title)
                          .join(", ")}
                        {student.enrolledCourses.length > 2 && ", ..."}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${avgProgress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.round(avgProgress)}% completed
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {lastEnrollment?.enrolledAt
                        ? lastEnrollment.enrolledAt.toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InstructorStudents;
