// src/pages/Home.jsx
import { Link } from "react-router-dom";
import Button from "../components/common/Button";
import { useEffect, useRef } from "react";

const Home = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    // Set canvas dimensions
    const setDimensions = () => {
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }
    };

    window.addEventListener("resize", setDimensions);
    setDimensions();

    // Particles array
    const particlesArray = [];
    const numberOfParticles = 120; // Increased number of particles

    // Create particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 6 + 1.5; // Increased size
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2})`; // Increased opacity
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.size > 0.3) this.size -= 0.01;

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

          if (distance < 120) {
            // Increased connection distance
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 - distance / 500})`; // Increased opacity
            ctx.lineWidth = 0.8; // Thicker lines
            ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
            ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
            ctx.stroke();
          }
        }

        // Regenerate particles
        if (particlesArray[i].size <= 0.3) {
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

  return (
    <div className="bg-white">
      {/* Full-screen Hero Section with enhanced animation */}
      <div className="bg-gradient-to-r from-gray-900 to-grey-800 text-white relative h-screen flex items-center overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ opacity: 0.8 }} // Increased opacity from 0.7 to 0.8
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/40" />

        <div className="max-w-7xl mx-auto px-4 w-full relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-8 text-shadow animate-fade-in">
              Discover Your Capabilities with E-Learning
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-shadow-md animate-fade-in-delay">
              Gain access to top-tier courses and enhance your expertise from
              any location, at any time.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-delay-2">
              <Link to="/courses">
                <Button size="lg" className="font-bold text-lg px-8 py-4">
                  Explore Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Categories */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Featured Categories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">
                    {category.name}
                  </h3>

                  <Link
                    to={`/courses?category=${category.slug}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Browse Courses →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-6">About Us</h2>
            <p className="text-lg text-gray-700 text-center max-w-3xl mx-auto">
              StudyNest is dedicated to empowering learners worldwide by
              providing access to high-quality, flexible, and engaging online
              education. Our mission is to bridge the gap between ambition and
              achievement, making learning accessible to everyone, everywhere.
              Whether you are looking to upskill, reskill, or explore new
              interests, StudyNest is your trusted partner on your educational
              journey.
            </p>
          </div>
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.id} className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 text-2xl font-bold">
                    {step.id}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Sample data
const categories = [
  { id: 1, name: "Web Development", courses: 42, slug: "web-development" },
  { id: 2, name: "Data Science", courses: 33, slug: "data-science" },
  { id: 3, name: "Business", courses: 28, slug: "business" },
  { id: 4, name: "Design", courses: 24, slug: "design" },
];

const steps = [
  {
    id: 1,
    title: "Find the Right Course",
    description:
      "Browse our catalog of courses to find what aligns with your goals.",
  },
  {
    id: 2,
    title: "Learn at Your Pace",
    description:
      "Access course materials anytime, anywhere, and learn at your own pace.",
  },
  {
    id: 3,
    title: "Get Certified",
    description:
      "Complete assessments and earn certificates to showcase your skills.",
  },
];

export default Home;
