// src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../firebase";
import Button from "../components/common/Button";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student"); // Default role is student
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    setError("");
    setLoading(true);

    try {
      await registerUser(email, password, name, role);
      navigate("/login");
    } catch (error) {
      setError("Failed to create an account. " + error.message);
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Card content */}
      <div className="max-w-md w-full space-y-6 relative z-10 p-8 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-white border-opacity-20">
        <div className="text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-bold text-white mb-2 transform hover:scale-105 transition-transform">
              StudyNest
            </h1>
          </Link>
          <div className="w-16 h-1 bg-blue-400 mx-auto mb-6 rounded-full"></div>
        </div>

        {error && (
          <div
            className="bg-red-400 bg-opacity-20 border border-red-400 border-opacity-30 text-white px-4 py-3 rounded-lg relative animate-pulse"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="group">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-blue-100 mb-1 ml-1"
              >
                Full Name
              </label>
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="appearance-none block w-full px-4 py-3 border-0 rounded-lg text-white bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200 placeholder-blue-300"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="group">
              <label
                htmlFor="email-address"
                className="block text-sm font-medium text-blue-100 mb-1 ml-1"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-4 py-3 border-0 rounded-lg text-white bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200 placeholder-blue-300"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="group">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-blue-100 mb-1 ml-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full px-4 py-3 border-0 rounded-lg text-white bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200 placeholder-blue-300"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="group">
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-blue-100 mb-1 ml-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full px-4 py-3 border-0 rounded-lg text-white bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200 placeholder-blue-300"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="group">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-blue-100 mb-1 ml-1"
              >
                I am a
              </label>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <input
                    id="student-role"
                    name="role"
                    type="radio"
                    value="student"
                    checked={role === "student"}
                    onChange={(e) => setRole(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="student-role"
                    className="ml-2 block text-sm text-blue-100"
                  >
                    Student
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="instructor-role"
                    name="role"
                    type="radio"
                    value="instructor"
                    checked={role === "instructor"}
                    onChange={(e) => setRole(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="instructor-role"
                    className="ml-2 block text-sm text-blue-100"
                  >
                    Instructor
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/login"
                className="font-medium text-blue-200 hover:text-white transition-colors"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full py-3 mt-4 rounded-lg transition-all duration-200 bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 transform hover:translate-y-1 shadow-lg"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
