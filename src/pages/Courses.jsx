// src/pages/Courses.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllCourses } from "../services/courseService";
import { useAuth } from "../contexts/AuthContext";
import { BookOpen, Clock, Users, Tag } from "lucide-react";

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const coursesData = await getAllCourses();
        setCourses(coursesData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses. Please try again later.");
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses =
    filter === "all"
      ? courses
      : courses.filter((course) => course.level === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative bg-gradient-to-r from-gray-600 to-gray-800 text-white py-16">
        <div className="absolute inset-0 bg-gray-800 opacity-20 pattern-dots pattern-size-4 pattern-opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Expand Your Knowledge
            </h1>
            <p className="text-xl max-w-3xl mx-auto">
              Discover our collection of high-quality courses designed to help
              you master new skills
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4 justify-center">
          <button
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setFilter("all")}
          >
            All Courses
          </button>
          <button
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === "beginner"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setFilter("beginner")}
          >
            Beginner
          </button>
          <button
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === "intermediate"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setFilter("intermediate")}
          >
            Intermediate
          </button>
          <button
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === "advanced"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setFilter("advanced")}
          >
            Advanced
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Courses grid */}
            {filteredCourses.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium text-gray-700">
                  No courses found
                </h3>
                <p className="text-gray-500 mt-2">
                  Try adjusting your filters or check back later for new
                  courses.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.map((course) => (
                  <Link
                    to={`/courses/${course.id}`}
                    key={course.id}
                    className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden flex flex-col h-full"
                  >
                    <div className="relative">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        {course.level}
                      </div>
                    </div>
                    <div className="p-6 flex-grow flex flex-col">
                      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 mb-4 flex-grow line-clamp-3">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{course.enrollmentsCount || 0} students</span>
                        </div>
                      </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img
                            src={
                              course.instructorAvatar ||
                              "https://via.placeholder.com/40"
                            }
                            alt={course.instructor}
                            className="w-8 h-8 rounded-full object-cover mr-2"
                          />
                          <span className="text-sm font-medium">
                            {course.instructor}
                          </span>
                        </div>
                        <div className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                          Free
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
