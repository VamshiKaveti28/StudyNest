// src/components/layout/Footer.jsx
const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">StudyNest</h3>
            <p className="text-blue-200">
              Empowering learning through technology.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
            <ul className="text-blue-200">
              <li className="mb-1">
                <a href="/" className="hover:text-white">
                  Home
                </a>
              </li>
              <li className="mb-1">
                <a href="/courses" className="hover:text-white">
                  Courses
                </a>
              </li>
            </ul>
          </div>
          <div id="contact-section">
            <h3 className="text-lg font-semibold mb-2">Contact</h3>
            <p className="text-blue-200">Email: info@elearning.com</p>
            <p className="text-blue-200">Phone: +1 (123) 456-7890</p>
          </div>
        </div>
        <div className="mt-8 border-t border-white-800 pt-6 text-center text-white-900">
          <p>
            &copy; {new Date().getFullYear()} StudyNest. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
