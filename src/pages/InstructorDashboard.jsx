// src/pages/InstructorDashboard.jsx (updated)
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getUserRole, getUserProfile } from "../services/userService";
import { logoutUser } from "../firebase";
import Button from "../components/common/Button";
import InstructorCourses from "../components/instructor/InstructorCourses";
import CourseForm from "../components/instructor/CourseForm";
import InstructorStudents from "../components/instructor/InstructorStudents";
import EnrollmentRequests from "../components/instructor/EnrollmentRequests";
import { Book, FilePlus, Users, LogOut, UserCheck } from "lucide-react";

const InstructorDashboard = () => {
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("courses");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!currentUser) {
          navigate("/login");
          return;
        }

        const role = await getUserRole(currentUser.uid);
        if (role !== "instructor") {
          // If not an instructor, redirect to home
          navigate("/");
          return;
        }

        // Fetch the user profile data
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/");
      }
    };

    fetchUserData();
  }, [currentUser, navigate]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const handleCreateNewCourse = () => {
    setActiveTab("create");
  };

  const handleCourseCreated = () => {
    // Switch back to courses tab after creating a course
    setActiveTab("courses");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Instructor Dashboard
              </h1>
              <p className="text-lg text-blue-100">
                {userProfile?.name || currentUser?.displayName || "Instructor"}{" "}
                • {userProfile?.email || currentUser?.email}
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border border-white text-white hover:bg-blue-800"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Tabs */}
        <div className="flex flex-wrap border-b border-gray-200 mb-8">
          <button
            className={`py-4 px-6 font-medium text-sm flex items-center ${
              activeTab === "courses"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("courses")}
          >
            <Book className="w-5 h-5 mr-2" />
            My Courses
          </button>
          <button
            className={`py-4 px-6 font-medium text-sm flex items-center ${
              activeTab === "create"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("create")}
          >
            <FilePlus className="w-5 h-5 mr-2" />
            Create Course
          </button>
          <button
            className={`py-4 px-6 font-medium text-sm flex items-center ${
              activeTab === "students"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("students")}
          >
            <Users className="w-5 h-5 mr-2" />
            Students
          </button>
          <button
            className={`py-4 px-6 font-medium text-sm flex items-center ${
              activeTab === "enrollment-requests"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("enrollment-requests")}
          >
            <UserCheck className="w-5 h-5 mr-2" />
            Enrollment Requests
          </button>
        </div>

        {/* Dashboard Content */}
        <div className="bg-white rounded-xl shadow-md p-6">
          {activeTab === "courses" && (
            <InstructorCourses onCreateNewClick={handleCreateNewCourse} />
          )}

          {activeTab === "create" && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Create New Course
              </h2>
              <CourseForm onCourseCreated={handleCourseCreated} />
            </div>
          )}

          {activeTab === "students" && <InstructorStudents />}

          {activeTab === "enrollment-requests" && <EnrollmentRequests />}
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
