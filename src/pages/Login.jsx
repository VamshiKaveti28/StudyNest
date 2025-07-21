// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../firebase";
import Button from "../components/common/Button";
import { getUserRole } from "../services/userService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await loginUser(email, password);
      // Get the user role from the profiles collection
      const userRole = await getUserRole(user.uid);

      // Redirect based on user role
      if (userRole === "instructor") {
        navigate("/instructor-dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      setError("Failed to log in. Please check your credentials.");
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Card content */}
      <div className="max-w-md w-full space-y-8 relative z-10 p-8 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-white border-opacity-20">
        <div className="text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-bold text-white mb-2 transform hover:scale-105 transition-transform">
              StudyNest
            </h1>
          </Link>
          <div className="w-16 h-1 bg-blue-400 mx-auto mb-6 rounded-full"></div>
          <h2 className="text-3xl font-extrabold text-white mb-2">
            Hello Learner
          </h2>
          <p className="text-blue-100 mb-6">
            Sign in to continue your learning journey
          </p>
        </div>

        {error && (
          <div
            className="bg-red-400 bg-opacity-20 border border-red-400 border-opacity-30 text-white px-4 py-3 rounded-lg relative animate-pulse"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
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
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full px-4 py-3 border-0 rounded-lg text-white bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200 placeholder-blue-300"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/register"
                className="font-medium text-blue-200 hover:text-white transition-colors"
              >
                Need an account? Sign up
              </Link>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full py-3 rounded-lg transition-all duration-200 bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 transform hover:translate-y-1 shadow-lg"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
