// src/pages/Profile.jsx - Updated
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { logoutUser } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { getCourseById, getCertificateId } from "../services/courseService";
import { getUserProfile } from "../services/userService";
import Button from "../components/common/Button";
import ProfileEdit from "../components/profile/ProfileEdit";
import {
  User,
  Mail,
  LogOut,
  BookOpen,
  Award,
  Clock,
  Download,
  Edit,
  Briefcase,
  MapPin,
  Globe,
  GraduationCap,
  Tag,
} from "lucide-react";
import CertificateModal from "../components/CertificateModal";

const Profile = () => {
  const { currentUser } = useAuth();
  const [error, setError] = useState("");
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Simulated user data (in a real app, this would come from Firebase or another backend)
  const userData = {
    courses: 3,
    certificates: 1,
    learningHours: 3,
  };

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else {
      fetchUserData();
    }
  }, [currentUser, navigate]);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Fetch user profile
      const profileData = await getUserProfile(currentUser.uid);
      setUserProfile(profileData);

      // Fetch enrollments
      await fetchUserCourses();

      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setLoading(false);
    }
  };

  const fetchUserCourses = async () => {
    try {
      const enrollmentsRef = collection(db, "enrollments");
      const q = query(enrollmentsRef, where("userId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);

      const enrollmentsData = [];
      const completedData = [];

      // Process each enrollment
      for (const doc of querySnapshot.docs) {
        const enrollment = { id: doc.id, ...doc.data() };

        // Skip enrollments without courseId or with pending status
        if (!enrollment.courseId || enrollment.status === "pending") {
          continue;
        }

        try {
          const course = await getCourseById(enrollment.courseId);

          const enhancedEnrollment = {
            ...enrollment,
            course,
          };

          enrollmentsData.push(enhancedEnrollment);

          // Check if course is completed (progress is 100%)
          // Fixed: Use strict comparison to ensure we're checking for exactly 100% progress
          if (enrollment.progress === 100) {
            completedData.push(enhancedEnrollment);
          }
        } catch (err) {
          console.error(`Error fetching course ${enrollment.courseId}:`, err);
          // Continue with next enrollment even if one fails
        }
      }

      setEnrolledCourses(enrollmentsData);
      setCompletedCourses(completedData);
    } catch (error) {
      console.error("Error fetching user courses:", error);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date.seconds ? date.seconds * 1000 : date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const generateCertificateId = (courseId) => {
    // Generate a unique certificate ID based on user ID and course ID
    return `NN-${courseId.slice(0, 4).toUpperCase()}-${currentUser.uid.slice(
      0,
      4
    )}-${Math.floor(Math.random() * 10000000)
      .toString()
      .padStart(8, "0")}`;
  };

  const openCertificate = async (course) => {
    try {
      // Extract hours from course duration (e.g., "10 hours" -> "10")
      const hoursMatch = course.course?.duration?.match(/(\d+)/);
      const courseHours = hoursMatch ? hoursMatch[0] : "0";

      // Get the persistent certificate ID
      const certificateId = await getCertificateId(
        currentUser.uid,
        course.courseId
      );

      // Format the certificate data
      setCertificateData({
        studentName: userProfile?.name || currentUser.displayName,
        courseName: course.course?.title || "Course",
        hours: courseHours,
        completionDate: formatDate(course.enrolledAt),
        instructorName: course.course?.instructor || "Instructor",
        certificateId: certificateId,
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error opening certificate:", error);
      setError("Failed to generate certificate. Please try again.");
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    // Set canvas dimensions
    const setDimensions = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener("resize", setDimensions);
    setDimensions();

    // Particles array
    const particlesArray = [];
    const numberOfParticles = 60;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 4 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.color = `rgba(100, 150, 255, ${Math.random() * 0.2 + 0.05})`;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.size > 0.2) this.size -= 0.01;

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.speedX = -this.speedX;
        if (this.y < 0 || this.y > canvas.height) this.speedY = -this.speedY;
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Initialize particles
    const init = () => {
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();

        // Draw lines between particles
        for (let j = i; j < particlesArray.length; j++) {
          const dx = particlesArray[i].x - particlesArray[j].x;
          const dy = particlesArray[i].y - particlesArray[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(100, 150, 255, ${0.1 - distance / 1000})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
            ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
            ctx.stroke();
          }
        }

        // Regenerate particles
        if (particlesArray[i].size <= 0.2) {
          particlesArray.splice(i, 1);
          i--;
          particlesArray.push(new Particle());
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", setDimensions);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  async function handleLogout() {
    setError("");

    try {
      await logoutUser();
      navigate("/login");
    } catch {
      setError("Failed to log out");
    }
  }

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Refresh profile data after editing
    fetchUserData();
  };

  if (!currentUser) return null;

  // Stats from actual data
  const stats = [
    {
      id: 1,
      title: "Courses Enrolled",
      value: enrolledCourses.length.toString(),
      icon: <BookOpen className="w-6 h-6 text-blue-400" />,
    },
    {
      id: 2,
      title: "Certificates Earned",
      value: completedCourses.length.toString(),
      icon: <Award className="w-6 h-6 text-blue-400" />,
    },
    // {
    //   id: 3,
    //   title: "Learning Hours",
    //   value: userData.learningHours.toString(),
    //   icon: <Clock className="w-6 h-6 text-blue-400" />,
    // },
    {
      id: 3,
      title: "Learning Hours",
      value: userData?.learningHours != null
        ? userData.learningHours.toString()
        : "0",
      icon: <Clock className="w-6 h-6 text-blue-400" />,
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden relative">
      {/* Background animation */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 opacity-90"></div>

      <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 animate-pulse"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {isEditing ? (
          <ProfileEdit onCancel={handleCancelEdit} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-2xl shadow-xl border border-white border-opacity-20 p-8 transform transition-all duration-300 hover:shadow-2xl">
              <div className="flex flex-col items-center text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <span className="text-4xl font-bold text-white">
                    {currentUser.displayName
                      ? currentUser.displayName.charAt(0).toUpperCase()
                      : "?"}
                  </span>
                </div>

                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {userProfile?.name || currentUser.displayName || "User"}
                </h1>

                <div className="flex items-center text-gray-500 mb-2">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{currentUser.email}</span>
                </div>

                {userProfile?.profession && (
                  <div className="flex items-center text-gray-500 mb-2">
                    <Briefcase className="w-4 h-4 mr-2" />
                    <span>{userProfile.profession}</span>
                  </div>
                )}

                {userProfile?.location && (
                  <div className="flex items-center text-gray-500 mb-6">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{userProfile.location}</span>
                  </div>
                )}

                {userProfile?.bio && (
                  <div className="text-gray-600 border-t border-gray-200 pt-4 mb-4">
                    <p className="italic">{userProfile.bio}</p>
                  </div>
                )}

                <div className="mt-2 w-full space-y-2">
                  <Button
                    className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700"
                    onClick={handleEditProfile}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>

                  <Button
                    className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => navigate("/roadmap")}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    AI Learning Roadmap
                  </Button>

                  <Button
                    variant="danger"
                    className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats and Activity */}
            <div className="lg:col-span-2 space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat) => (
                  <div
                    key={stat.id}
                    className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-white border-opacity-20"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-blue-700 mt-1">
                          {stat.value}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-full">
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Education & Interests */}
              {(userProfile?.education?.length > 0 ||
                userProfile?.interests?.length > 0) && (
                <div className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6 border border-white border-opacity-20">
                  {userProfile?.education?.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <GraduationCap className="w-5 h-5 mr-2" />
                        Education
                      </h2>

                      <div className="space-y-3">
                        {userProfile.education.map((edu, index) => (
                          <div
                            key={index}
                            className="bg-blue-50 p-3 rounded-md"
                          >
                            <div className="font-semibold text-blue-800">
                              {edu.degree}
                            </div>
                            <div className="text-gray-600">
                              {edu.institution} {edu.year && `(${edu.year})`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {userProfile?.interests?.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <Tag className="w-5 h-5 mr-2" />
                        Interests
                      </h2>

                      <div className="flex flex-wrap gap-2">
                        {userProfile.interests.map((interest, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Current Courses */}
              {enrolledCourses.length > 0 && (
                <div className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6 border border-white border-opacity-20">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    My Courses
                  </h2>

                  {loading ? (
                    <div className="py-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-gray-500">
                        Loading your courses...
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {enrolledCourses.map((enrollment) => (
                        <div
                          key={enrollment.id}
                          className="p-4 border border-blue-100 rounded-lg bg-blue-50 bg-opacity-50"
                        >
                          <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-blue-800">
                              {enrollment.course?.title || "Untitled Course"}
                            </h3>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                enrollment.progress === 100
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {enrollment.progress === 100
                                ? "Completed"
                                : "In Progress"}
                            </span>
                          </div>
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${
                                  enrollment.progress === 100
                                    ? "bg-green-600"
                                    : "bg-blue-600"
                                }`}
                                style={{ width: `${enrollment.progress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {enrollment.progress}% Complete
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Completed Courses / Certificates */}
              {completedCourses.length > 0 && (
                <div className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6 border border-white border-opacity-20">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    My Certificates
                  </h2>

                  <div className="space-y-4">
                    {completedCourses.map((course) => (
                      <div
                        key={`cert-${course.id}`}
                        className="p-4 border border-green-100 rounded-lg bg-green-50 bg-opacity-50"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold text-green-800">
                              {course.course?.title || "Completed Course"}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Completed on {formatDate(course.enrolledAt)}
                            </p>
                          </div>
                          <Button
                            onClick={() => openCertificate(course)}
                            className="flex items-center text-sm bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            View Certificate
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        certificateData={certificateData}
      />
    </div>
  );
};

export default Profile;
