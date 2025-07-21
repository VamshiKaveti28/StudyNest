// src/App.jsx
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  const location = useLocation();

  // Don't show header and footer on login, register, profile, instructor-dashboard and courses pages
  const isAuthPage = ["/login", "/register"].includes(location.pathname);
  const isProfilePage = location.pathname === "/profile";
  const isInstructorDashboard = location.pathname === "/instructor-dashboard";
  const isCoursesPage =
    location.pathname === "/courses" ||
    location.pathname.startsWith("/courses/");

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        {!isAuthPage && !isInstructorDashboard && <Navbar />}
        <main className={`flex-grow ${isAuthPage ? "" : ""}`}>
          <Outlet />
        </main>
        {!isAuthPage &&
          !isProfilePage &&
          !isCoursesPage &&
          !isInstructorDashboard && <Footer />}
      </div>
    </AuthProvider>
  );
}

export default App;
