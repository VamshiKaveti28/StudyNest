// src/pages/CourseDetail.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getCourseById,
  getCourseLessons,
  isUserEnrolled,
  enrollInCourse,
  updateLessonProgress,
  getUserCourseProgress,
  getEnrollmentStatus,
} from "../services/courseService";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/common/Button";
import {
  Clock,
  Users,
  BookOpen,
  CheckCircle,
  PlayCircle,
  Award,
  AlertTriangle,
} from "lucide-react";
import CourseReviews from "../components/CourseReviews";

const CourseDetail = () => {
  const { courseId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("content"); // 'content' or 'reviews'
  const [loadingEnroll, setLoadingEnroll] = useState(false);
  // Add a new state for enrollment status
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get course details
        const courseData = await getCourseById(courseId);
        setCourse(courseData);

        // Get lessons for this course
        const lessonsData = await getCourseLessons(courseId);

        if (lessonsData && lessonsData.length > 0) {
          setLessons(lessonsData);
          setCurrentLesson(lessonsData[0]);
        } else {
          setLessons([]);
          setCurrentLesson(null);
        }

        // Check if user is enrolled
        if (currentUser) {
          const isEnrolled = await isUserEnrolled(courseId);
          setEnrolled(isEnrolled);

          // Get enrollment status
          const status = await getEnrollmentStatus(courseId);
          setEnrollmentStatus(status);

          if (isEnrolled) {
            const userProgress = await getUserCourseProgress(courseId);
            setProgress(userProgress);
          }
        } else {
          setEnrolled(false);
          setProgress(null);
          setEnrollmentStatus(null);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching course data:", err);
        setError("Failed to load course. Please try again later.");
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, currentUser]);

  const handleEnroll = async () => {
    if (!currentUser) {
      navigate("/login", { state: { from: `/courses/${courseId}` } });
      return;
    }

    try {
      setLoadingEnroll(true);
      setError(null);

      const result = await enrollInCourse(courseId);

      if (result.status === "pending") {
        // Show pending message
        setEnrolled(false);
        setEnrollmentStatus("pending");
      } else if (
        result.status === "approved" ||
        result.status === "already-enrolled"
      ) {
        // Successfully enrolled
        setEnrolled(true);
        setEnrollmentStatus("approved");

        // Refresh progress data
        const userProgress = await getUserCourseProgress(courseId);
        setProgress(userProgress);
      }

      setLoadingEnroll(false);
    } catch (err) {
      console.error("Error enrolling in course:", err);
      setError(`Failed to enroll in course: ${err.message}`);
      setLoadingEnroll(false);
    }
  };

  const handleLessonComplete = async () => {
    if (!currentUser || !enrolled || !currentLesson) return;

    try {
      setError(null);

      // Pass true to mark the lesson as complete
      const newProgress = await updateLessonProgress(
        courseId,
        currentLesson.id,
        true
      );

      // Force progress to be exactly 100 if all lessons are completed
      const updatedProgress = newProgress;

      // Update local state with the new progress
      setProgress((prev) => {
        // Ensure completedLessons is always an array
        const completedLessons = prev?.completedLessons || [];

        return {
          ...prev,
          progress: updatedProgress,
          completedLessons: [
            ...new Set([...completedLessons, currentLesson.id]),
          ],
        };
      });

      // Refresh the course data to ensure we have the latest progress information
      const userProgress = await getUserCourseProgress(courseId);
      setProgress(userProgress);
    } catch (err) {
      console.error("Error marking lesson as complete:", err);
      setError("Failed to mark lesson as complete. Please try again.");
    }
  };

  const changeLesson = (lesson) => {
    setCurrentLesson(lesson);
    window.scrollTo(0, 0);
  };

  // Render the enrollment button or status based on the current state
  const renderEnrollmentButton = () => {
    if (!currentUser) {
      return (
        <Button
          size="lg"
          className="w-full md:w-auto py-3 px-8 text-lg bg-gray text-gray-700 hover:bg-blue-50"
          onClick={handleEnroll}
        >
          Sign in to Enroll
        </Button>
      );
    }

    if (enrolled) {
      return (
        <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm rounded-lg p-4 w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Your Progress</span>
            <span className="font-bold">
              {Math.round(progress?.progress || 0)}%
            </span>
          </div>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-2.5">
            <div
              className="bg-blue-400 h-2.5 rounded-full"
              style={{ width: `${progress?.progress || 0}%` }}
            ></div>
          </div>
        </div>
      );
    }

    if (enrollmentStatus === "pending") {
      return (
        <div className="bg-yellow-100 text-yellow-800 rounded-lg p-4 w-full">
          <p className="font-medium text-center">Enrollment Pending Approval</p>
          <p className="text-sm mt-1 text-center">
            The instructor will review your enrollment request.
          </p>
        </div>
      );
    }

    return (
      <Button
        size="lg"
        className="w-full md:w-auto py-3 px-8 text-lg text-blue-700 hover:bg-blue-50 mr-2"
        onClick={handleEnroll}
        disabled={loadingEnroll}
      >
        {loadingEnroll ? "Enrolling..." : "Enroll Now - Free"}
      </Button>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Course not found</h2>
          <p className="mt-2 text-gray-600">
            The course you're looking for does not exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const isLessonCompleted = (lessonId) => {
    return progress?.completedLessons?.includes(lessonId) || false;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-gray-600 to-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {course.title}
              </h1>
              <p className="text-lg text-blue-100 mb-6">{course.description}</p>

              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  <span>{lessons.length} lessons</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  <span>{course.enrollmentsCount || 0} enrolled</span>
                </div>
              </div>

              <div className="flex items-center">
                <div className="mr-4">
                  <img
                    src={
                      course.instructorAvatar ||
                      "https://via.placeholder.com/60"
                    }
                    alt={course.instructor}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white"
                  />
                </div>
                <div>
                  <div className="text-sm text-blue-200">Instructor</div>
                  <div className="font-medium">{course.instructor}</div>
                </div>
              </div>
            </div>

            <div className="md:w-1/3 flex items-center justify-center md:justify-end">
              {renderEnrollmentButton()}

              {/* Display enrollment limit if applicable */}
              {course.enrollmentLimit > 0 && (
                <div className="mt-2 text-center text-sm text-white">
                  <span>
                    Limited spots: {course.enrollmentsCount || 0}/
                    {course.enrollmentLimit}
                  </span>
                </div>
              )}

              {/* Display approval requirement if applicable */}
              {course.requiresApproval &&
                !enrolled &&
                enrollmentStatus !== "pending" && (
                  <div className="mt-2 text-center text-sm text-white">
                    <span>Requires instructor approval</span>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === "content"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("content")}
          >
            Course Content
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === "reviews"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews
          </button>
        </div>

        {activeTab === "content" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content - Video player */}
            <div className="lg:col-span-2">
              {currentLesson ? (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {/* Video Player */}
                  <div className="aspect-w-16 aspect-h-9 bg-gray-900">
                    {enrolled ? (
                      currentLesson.videoUrl ? (
                        <iframe
                          src={currentLesson.videoUrl}
                          allowFullScreen
                          className="w-full h-full"
                          title={currentLesson.title}
                        ></iframe>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-white">
                          <AlertTriangle className="w-16 h-16 text-yellow-400 mb-4" />
                          <h3 className="text-xl font-semibold mb-2">
                            No video available
                          </h3>
                          <p className="text-gray-300 text-center max-w-md">
                            This lesson doesn't have a video yet.
                          </p>
                        </div>
                      )
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-white">
                        <div className="mb-4">
                          <PlayCircle className="w-16 h-16" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                          Enroll to watch this lesson
                        </h3>
                        <p className="text-gray-300 text-center max-w-md mb-4">
                          This content is available after enrolling in the
                          course
                        </p>
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6"
                          onClick={handleEnroll}
                          disabled={loadingEnroll}
                        >
                          {loadingEnroll ? "Enrolling..." : "Enroll Now - Free"}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Lesson Info */}
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold text-gray-800">
                        {currentLesson.title}
                      </h2>

                      {enrolled && (
                        <Button
                          variant={
                            isLessonCompleted(currentLesson.id)
                              ? "success"
                              : "primary"
                          }
                          className={`flex items-center ${
                            isLessonCompleted(currentLesson.id)
                              ? "bg-green-600 hover:bg-green-700"
                              : ""
                          }`}
                          onClick={handleLessonComplete}
                          disabled={isLessonCompleted(currentLesson.id)}
                        >
                          <CheckCircle className="w-5 h-5 mr-2" />
                          {isLessonCompleted(currentLesson.id)
                            ? "Completed"
                            : "Mark as Complete"}
                        </Button>
                      )}
                    </div>

                    <p className="text-gray-600">{currentLesson.description}</p>

                    {currentLesson.duration && (
                      <div className="mt-4 flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>Duration: {currentLesson.duration}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    No lessons available
                  </h2>
                  <p className="text-gray-600">
                    This course doesn't have any lessons yet.
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar - Course content */}
            <div>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-6">
                <div className="p-4 bg-blue-50 border-b border-blue-100">
                  <h3 className="text-lg font-bold text-gray-800">
                    Course Content
                  </h3>
                  <p className="text-sm text-gray-600">
                    {lessons.length} lessons • {course.duration}
                  </p>
                </div>

                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {lessons.length > 0 ? (
                    lessons.map((lesson, index) => (
                      <div
                        key={lesson.id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                          currentLesson?.id === lesson.id ? "bg-blue-50" : ""
                        }`}
                        onClick={() =>
                          enrolled ? changeLesson(lesson) : handleEnroll()
                        }
                      >
                        <div className="flex">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-medium text-sm mr-3">
                            {isLessonCompleted(lesson.id) ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div>
                            <h4
                              className={`font-medium ${
                                currentLesson?.id === lesson.id
                                  ? "text-blue-700"
                                  : "text-gray-800"
                              }`}
                            >
                              {lesson.title}
                            </h4>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <PlayCircle className="w-4 h-4 mr-1" />
                              <span>{lesson.duration || "Video"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      No lessons available yet.
                    </div>
                  )}
                </div>

                {enrolled && progress?.progress === 100 && (
                  <div className="p-4 bg-green-50 border-t border-green-100 flex items-center justify-center">
                    <div className="flex items-center text-green-700">
                      <Award className="w-5 h-5 mr-2" />
                      <span className="font-medium">Course Completed!</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <CourseReviews courseId={courseId} isEnrolled={enrolled} />
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
