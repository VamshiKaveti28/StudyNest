// src/components/layout/Navbar.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../common/Button";
import { useState } from "react";

const categories = [
  { id: 1, name: "Web Development", slug: "web-development" },
  { id: 2, name: "Data Science", slug: "data-science" },
  { id: 3, name: "Business", slug: "business" },
  { id: 4, name: "Design", slug: "design" },
];

const Navbar = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Smooth scroll helper
  const smoothScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle About/Contact click
  const handleNavScroll = (sectionId) => {
    if (location.pathname === "/") {
      setTimeout(() => smoothScrollTo(sectionId), 100);
    } else {
      navigate("/", { replace: false });
      setTimeout(() => smoothScrollTo(sectionId), 400);
    }
    setMobileMenuOpen(false);
  };

  // Handle logo click
  const handleLogoClick = (e) => {
    e.preventDefault();
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 400);
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-gray-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative flex items-center h-16">
          {/* Left: Logo */}
          <div className="flex items-center flex-shrink-0 z-10">
            <a
              href="/"
              className="text-xl font-bold text-white hover:text-blue-200 transition-colors"
              onClick={handleLogoClick}
            >
              StudyNest
            </a>
          </div>

          {/* Hamburger for mobile */}
          <div className="lg:hidden flex items-center ml-auto z-10">
            <button
              className="flex flex-col justify-center items-center w-10 h-10 focus:outline-none"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label="Open menu"
            >
              <span
                className={`block h-0.5 w-6 rounded-sm bg-white transition-all duration-300 ${
                  mobileMenuOpen
                    ? "rotate-45 translate-y-1.5"
                    : "-translate-y-1.5"
                }`}
              ></span>
              <span
                className={`block h-0.5 w-6 rounded-sm bg-white transition-all duration-300 my-1 ${
                  mobileMenuOpen ? "opacity-0" : "opacity-100"
                }`}
              ></span>
              <span
                className={`block h-0.5 w-6 rounded-sm bg-white transition-all duration-300 ${
                  mobileMenuOpen
                    ? "-rotate-45 -translate-y-1.5"
                    : "translate-y-1.5"
                }`}
              ></span>
            </button>
          </div>

          {/* Center: About, Contact, Categories (desktop) */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center space-x-4 z-0">
            <button
              className="text-white hover:text-blue-200 font-semibold bg-transparent border-none focus:outline-none"
              onClick={() => handleNavScroll("how-it-works")}
            >
              About
            </button>
            <button
              className="text-white hover:text-blue-200 font-semibold bg-transparent border-none focus:outline-none"
              onClick={() => handleNavScroll("contact-section")}
            >
              Contact
            </button>
            <div className="relative">
              <button
                className="text-white hover:text-blue-200 font-semibold bg-transparent border-none focus:outline-none"
                onClick={() => setDropdownOpen((open) => !open)}
                onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                tabIndex={0}
              >
                Categories
              </button>
              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-44 bg-white text-gray-900 rounded shadow-lg z-50">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate(`/courses?category=${cat.slug}`);
                      }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Auth Buttons (desktop) */}
          <div className="hidden lg:flex items-center space-x-3 ml-auto z-10">
            <Link to="/courses">
              <Button variant="primary" size="sm" className="font-semibold">
                Courses
              </Button>
            </Link>
            {currentUser ? (
              <Link to="/profile">
                <Button variant="success" size="sm" className="font-semibold">
                  {currentUser.displayName || "Profile"}
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="danger" size="sm" className="font-semibold">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-semibold border-blue-600 text-blue-600"
                  >
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-60 z-50"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="absolute top-0 right-0 w-64 h-full bg-white text-gray-900 shadow-lg flex flex-col p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <a
              href="/"
              className="text-xl font-bold text-blue-500 mb-8"
              onClick={handleLogoClick}
            >
              StudyNest
            </a>
            <button
              className="text-blue-500 hover:text-blue-400 font-semibold text-left mb-4"
              onClick={() => handleNavScroll("how-it-works")}
            >
              About
            </button>
            <button
              className="text-blue-500 hover:text-blue-400 font-semibold text-left mb-4"
              onClick={() => handleNavScroll("contact-section")}
            >
              Contact
            </button>
            <div className="mb-4">
              <div className="text-blue-500 font-semibold mb-2">Categories</div>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className="block w-full text-left px-2 py-1 hover:bg-gray-100 text-gray-900"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(`/courses?category=${cat.slug}`);
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <Link to="/courses" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant="primary"
                size="sm"
                className="font-semibold w-full mb-2"
              >
                Courses
              </Button>
            </Link>
            {currentUser ? (
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="success"
                  size="sm"
                  className="font-semibold w-full mb-2"
                >
                  {currentUser.displayName || "Profile"}
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="danger"
                    size="sm"
                    className="font-semibold w-full mb-2"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-semibold border-blue-600 text-blue-600 w-full mb-2"
                  >
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
