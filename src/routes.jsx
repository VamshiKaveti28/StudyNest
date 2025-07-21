// src/routes.jsx
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import CoursesPage from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import InstructorDashboard from "./pages/InstructorDashboard";
import RoadmapGenerator from "./pages/RoadmapGenerator";
import ProtectedRoute from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "courses",
        element: <CoursesPage />,
      },
      {
        path: "courses/:courseId",
        element: <CourseDetail />,
      },
      {
        path: "instructor-dashboard",
        element: (
          <ProtectedRoute>
            <InstructorDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "roadmap",
        element: (
          <ProtectedRoute>
            <RoadmapGenerator />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
