import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/common/Button";
import {
  School,
  Clock,
  ArrowRight,
  Lightbulb,
  Map,
  BookOpen,
  Code,
  Database,
  ChartBar,
  Monitor,
  Rocket,
  Brain,
} from "lucide-react";

const RoadmapGenerator = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [career, setCareer] = useState("");
  const [timeline, setTimeline] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [priorExperience, setPriorExperience] = useState("none");
  const [learningStyle, setLearningStyle] = useState("balanced");
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState("");

  // Career options
  const careerOptions = [
    { id: "software-engineer", name: "Software Engineer", icon: <Code /> },
    { id: "data-scientist", name: "Data Scientist", icon: <Database /> },
    { id: "web-developer", name: "Web Developer", icon: <Monitor /> },
    { id: "ai-engineer", name: "AI Engineer", icon: <Brain /> },
    { id: "data-analyst", name: "Data Analyst", icon: <ChartBar /> },
    { id: "project-manager", name: "Project Manager", icon: <ChartBar /> },
  ];

  // Timeline options
  const timelineOptions = [
    { id: "3months", name: "3 Months", icon: <Clock /> },
    { id: "6months", name: "6 Months", icon: <Clock /> },
    { id: "1year", name: "1 Year", icon: <Clock /> },
  ];

  // Prior experience options
  const experienceOptions = [
    { id: "none", name: "No Experience" },
    { id: "beginner", name: "Some Basics" },
    { id: "intermediate", name: "Intermediate" },
    { id: "advanced", name: "Advanced" },
  ];

  // Learning style options
  const learningStyleOptions = [
    { id: "hands-on", name: "Hands-on Projects" },
    { id: "theoretical", name: "Theoretical Concepts" },
    { id: "balanced", name: "Balanced Approach" },
  ];

  const handleNextStep = () => {
    if (currentStep === 1 && !career) {
      setError("Please select a career path");
      return;
    }

    if (currentStep === 2 && !timeline) {
      setError("Please select a timeline");
      return;
    }

    setError("");
    setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const generateRoadmap = async () => {
    setLoading(true);
    setError("");

    try {
      setTimeout(() => {
        const mockRoadmapData = generateMockRoadmap(
          career,
          timeline,
          priorExperience,
          learningStyle
        );
        setRoadmap(mockRoadmapData);
        setLoading(false);
        setCurrentStep(4);
      }, 2000);
    } catch (error) {
      console.error("Error generating roadmap:", error);
      setError("Failed to generate roadmap. Please try again.");
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generateRoadmap();
  };

  const generateMockRoadmap = (career, timeline, experience, learningStyle) => {
    let timelineMonths = 3;
    switch (timeline) {
      case "3months":
        timelineMonths = 3;
        break;
      case "6months":
        timelineMonths = 6;
        break;
      case "1year":
        timelineMonths = 12;
        break;
      default:
        timelineMonths = 6;
    }

    let phases = [];

    if (career === "software-engineer") {
      if (experience === "none" || experience === "beginner") {
        phases = [
          {
            title: "Phase 1: Foundations",
            duration: "Month 1",
            description:
              "Build programming fundamentals with a focus on problem-solving",
            skills: [
              "Programming Basics",
              "Data Structures & Algorithms",
              "Git Version Control",
            ],
            resources: [
              {
                name: "CS50: Introduction to Computer Science",
                type: "Course",
              },
              { name: "Data Structures in JavaScript", type: "Book" },
              { name: "LeetCode Easy Problems", type: "Practice" },
            ],
            projects: ["Build a simple command-line application"],
          },
          {
            title: "Phase 2: Web Development Basics",
            duration: "Month 2",
            description: "Learn HTML, CSS, and JavaScript fundamentals",
            skills: ["HTML5", "CSS3", "JavaScript ES6+", "Responsive Design"],
            resources: [
              { name: "The Odin Project", type: "Course" },
              { name: "JavaScript.info", type: "Resource" },
              { name: "Front-end Mentor Challenges", type: "Practice" },
            ],
            projects: ["Personal portfolio website", "Interactive web app"],
          },
          {
            title: "Phase 3: Backend Development",
            duration: "Month 3",
            description: "Learn server-side programming and databases",
            skills: ["Node.js", "Express", "MongoDB", "RESTful APIs"],
            resources: [
              { name: "Node.js Documentation", type: "Resource" },
              { name: "MongoDB University", type: "Course" },
              { name: "REST API Design Best Practices", type: "Article" },
            ],
            projects: [
              "Full-stack CRUD application",
              "API integration project",
            ],
          },
        ];

        if (timelineMonths >= 6) {
          phases.push({
            title: "Phase 4: Advanced Concepts",
            duration: "Months 4-6",
            description: "Deepen your understanding with more advanced topics",
            skills: [
              "React",
              "Redux",
              "Testing",
              "CI/CD",
              "System Design Basics",
            ],
            resources: [
              { name: "React Documentation", type: "Resource" },
              { name: "Testing JavaScript with Jest", type: "Course" },
              { name: "Intro to System Design", type: "Article" },
            ],
            projects: [
              "Full-featured React application",
              "Testing implementation",
            ],
          });
        }

        if (timelineMonths >= 12) {
          phases.push({
            title: "Phase 5: Career Preparation",
            duration: "Months 7-12",
            description: "Build a solid portfolio and prepare for interviews",
            skills: [
              "System Design",
              "Design Patterns",
              "Interview Preparation",
              "Advanced DSA",
            ],
            resources: [
              { name: "System Design Interview", type: "Book" },
              { name: "DesignGuru", type: "Course" },
              { name: "LeetCode Medium/Hard Problems", type: "Practice" },
            ],
            projects: [
              "Full-stack application with complex features",
              "Open-source contributions",
            ],
          });
        }
      } else if (experience === "intermediate" || experience === "advanced") {
        phases = [
          {
            title: "Phase 1: Advanced Architecture",
            duration: "Month 1",
            description:
              "Deepen understanding of software architecture and design patterns",
            skills: [
              "Design Patterns",
              "Microservices",
              "Domain Driven Design",
            ],
            resources: [
              { name: "Clean Architecture", type: "Book" },
              { name: "Domain Driven Design Distilled", type: "Book" },
              { name: "Microservices Patterns", type: "Course" },
            ],
            projects: ["Refactoring project using design patterns"],
          },
          {
            title: "Phase 2: Scalability and Performance",
            duration: "Month 2",
            description: "Learn techniques for scalable and performant systems",
            skills: [
              "System Scalability",
              "Performance Optimization",
              "Load Balancing",
            ],
            resources: [
              { name: "Designing Data-Intensive Applications", type: "Book" },
              { name: "Performance Optimization Guide", type: "Article" },
              { name: "Load Balancing Techniques", type: "Course" },
            ],
            projects: ["Optimize an existing application for performance"],
          },
          {
            title: "Phase 3: Advanced Development Practices",
            duration: "Month 3",
            description: "Master advanced development and deployment practices",
            skills: [
              "CI/CD Pipelines",
              "Containerization",
              "Testing Strategies",
            ],
            resources: [
              { name: "CI/CD with Jenkins", type: "Course" },
              { name: "Docker for Developers", type: "Tutorial" },
              { name: "Advanced Testing with Jest", type: "Course" },
            ],
            projects: ["Set up a CI/CD pipeline", "Containerized application"],
          },
        ];

        if (timelineMonths >= 6) {
          phases.push({
            title: "Phase 4: System Design and Leadership",
            duration: "Months 4-6",
            description:
              "Develop expertise in system design and technical leadership",
            skills: [
              "System Design",
              "Technical Leadership",
              "Cloud Architecture",
              "Distributed Systems",
            ],
            resources: [
              { name: "System Design Interview", type: "Book" },
              { name: "AWS Architecture", type: "Course" },
              { name: "Distributed Systems Guide", type: "Article" },
            ],
            projects: [
              "Design a scalable system",
              "Lead a mock technical project",
            ],
          });
        }
      }
    } else if (career === "data-scientist") {
      if (experience === "none" || experience === "beginner") {
        phases = [
          {
            title: "Phase 1: Mathematics and Programming Foundations",
            duration: "Month 1",
            description:
              "Build essential math and programming skills for data science",
            skills: ["Python", "Linear Algebra", "Calculus", "Statistics"],
            resources: [
              { name: "Python for Data Science Handbook", type: "Book" },
              { name: "Khan Academy: Linear Algebra", type: "Course" },
              { name: "Statistics and Probability", type: "Course" },
            ],
            projects: ["Exploratory data analysis project"],
          },
          {
            title: "Phase 2: Data Analysis and Visualization",
            duration: "Month 2",
            description: "Learn to analyze and visualize data effectively",
            skills: ["Pandas", "NumPy", "Data Visualization", "SQL"],
            resources: [
              { name: "Data Analysis with Pandas", type: "Course" },
              { name: "Data Visualization in Python", type: "Tutorial" },
              { name: "SQL for Data Science", type: "Course" },
            ],
            projects: [
              "Data visualization dashboard",
              "SQL data analysis project",
            ],
          },
          {
            title: "Phase 3: Machine Learning Fundamentals",
            duration: "Month 3",
            description:
              "Understand core machine learning algorithms and implementation",
            skills: ["Scikit-learn", "Supervised Learning", "Model Evaluation"],
            resources: [
              {
                name: "Introduction to Machine Learning with Python",
                type: "Book",
              },
              { name: "Machine Learning Crash Course", type: "Course" },
              { name: "Kaggle Learn", type: "Tutorial" },
            ],
            projects: [
              "Predictive modeling competition",
              "Classification project",
            ],
          },
        ];

        if (timelineMonths >= 6) {
          phases.push({
            title: "Phase 4: Advanced Machine Learning",
            duration: "Months 4-6",
            description: "Learn advanced ML techniques and frameworks",
            skills: ["Deep Learning", "TensorFlow", "Feature Engineering"],
            resources: [
              { name: "Deep Learning with Python", type: "Book" },
              { name: "TensorFlow Tutorials", type: "Tutorial" },
              { name: "Feature Engineering Guide", type: "Article" },
            ],
            projects: ["Neural network implementation", "Kaggle competition"],
          });
        }

        if (timelineMonths >= 12) {
          phases.push({
            title: "Phase 5: Specialization and Deployment",
            duration: "Months 7-12",
            description: "Specialize in a domain and learn model deployment",
            skills: [
              "MLOps",
              "Model Deployment",
              "Domain Specialization",
              "Big Data",
            ],
            resources: [
              { name: "MLOps Fundamentals", type: "Course" },
              { name: "Big Data with Spark", type: "Course" },
              { name: "Domain-Specific Case Studies", type: "Resource" },
            ],
            projects: ["End-to-end ML pipeline", "Domain-specific ML project"],
          });
        }
      } else if (experience === "intermediate" || experience === "advanced") {
        phases = [
          {
            title: "Phase 1: Advanced ML Techniques",
            duration: "Month 1",
            description:
              "Master advanced machine learning concepts and frameworks",
            skills: [
              "Deep Learning",
              "Reinforcement Learning",
              "Advanced Feature Engineering",
            ],
            resources: [
              { name: "Deep Learning Specialization", type: "Course" },
              { name: "Reinforcement Learning", type: "Book" },
              { name: "Advanced Feature Engineering", type: "Article" },
            ],
            projects: ["Complex deep learning model implementation"],
          },
          {
            title: "Phase 2: Big Data and Scalability",
            duration: "Month 2",
            description:
              "Learn to handle large datasets and scalable ML systems",
            skills: ["Spark", "Hadoop", "Distributed Computing"],
            resources: [
              { name: "Big Data with Spark", type: "Course" },
              { name: "Hadoop Fundamentals", type: "Tutorial" },
              { name: "Distributed Computing Guide", type: "Article" },
            ],
            projects: ["Process large dataset with Spark"],
          },
          {
            title: "Phase 3: Model Optimization",
            duration: "Month 3",
            description:
              "Optimize machine learning models for performance and efficiency",
            skills: [
              "Model Tuning",
              "Hyperparameter Optimization",
              "Model Compression",
            ],
            resources: [
              { name: "Hyperparameter Tuning Guide", type: "Article" },
              { name: "Model Optimization Techniques", type: "Course" },
              { name: "Model Compression Tutorial", type: "Tutorial" },
            ],
            projects: ["Optimize a pre-trained ML model"],
          },
        ];

        if (timelineMonths >= 6) {
          phases.push({
            title: "Phase 4: MLOps and Deployment",
            duration: "Months 4-6",
            description: "Master model deployment and operationalization",
            skills: [
              "MLOps",
              "Model Monitoring",
              "Cloud Deployment",
              "Ethics in AI",
            ],
            resources: [
              { name: "MLOps with Kubernetes", type: "Course" },
              { name: "Model Monitoring Guide", type: "Article" },
              { name: "AWS SageMaker Tutorial", type: "Tutorial" },
            ],
            projects: [
              "Deploy an ML model to production",
              "Set up model monitoring",
            ],
          });
        }
      }
    } else if (career === "web-developer") {
      if (experience === "none" || experience === "beginner") {
        phases = [
          {
            title: "Phase 1: Front-end Fundamentals",
            duration: "Month 1",
            description: "Learn core web technologies and design principles",
            skills: ["HTML5", "CSS3", "JavaScript", "Responsive Design"],
            resources: [
              { name: "The Odin Project", type: "Course" },
              { name: "CSS Tricks", type: "Resource" },
              { name: "JavaScript.info", type: "Tutorial" },
            ],
            projects: ["Static portfolio website", "Responsive landing page"],
          },
          {
            title: "Phase 2: Front-end Frameworks",
            duration: "Month 2",
            description: "Master modern front-end frameworks and tools",
            skills: ["React", "State Management", "CSS Frameworks"],
            resources: [
              { name: "React Documentation", type: "Resource" },
              { name: "Tailwind CSS Guide", type: "Tutorial" },
              { name: "Redux Essentials", type: "Course" },
            ],
            projects: [
              "Single-page React application",
              "Interactive UI component",
            ],
          },
          {
            title: "Phase 3: Backend Basics",
            duration: "Month 3",
            description: "Learn server-side development and APIs",
            skills: ["Node.js", "Express", "REST APIs", "Authentication"],
            resources: [
              { name: "Node.js Crash Course", type: "Course" },
              { name: "Express Documentation", type: "Resource" },
              { name: "JWT Authentication Guide", type: "Article" },
            ],
            projects: ["Full-stack web app", "API-driven project"],
          },
        ];

        if (timelineMonths >= 6) {
          phases.push({
            title: "Phase 4: Advanced Web Development",
            duration: "Months 4-6",
            description: "Learn advanced web technologies and optimization",
            skills: [
              "Next.js",
              "Performance Optimization",
              "Testing",
              "Web Accessibility",
            ],
            resources: [
              { name: "Next.js Documentation", type: "Resource" },
              { name: "Web Performance Guide", type: "Article" },
              { name: "Web Accessibility Course", type: "Course" },
            ],
            projects: [
              "Server-side rendered web app",
              "Accessibility-focused project",
            ],
          });
        }

        if (timelineMonths >= 12) {
          phases.push({
            title: "Phase 5: Full-stack Expertise",
            duration: "Months 7-12",
            description: "Master full-stack development and deployment",
            skills: [
              "GraphQL",
              "CI/CD",
              "Cloud Deployment",
              "Advanced Testing",
            ],
            resources: [
              { name: "GraphQL with Apollo", type: "Course" },
              { name: "AWS Deployment Guide", type: "Tutorial" },
              { name: "Testing with Cypress", type: "Course" },
            ],
            projects: [
              "Complex full-stack application",
              "Open-source web project",
            ],
          });
        }
      } else if (experience === "intermediate" || experience === "advanced") {
        phases = [
          {
            title: "Phase 1: Advanced Web Architecture",
            duration: "Month 1",
            description:
              "Master advanced web development patterns and frameworks",
            skills: [
              "Micro-frontends",
              "Serverless Architecture",
              "Advanced React Patterns",
            ],
            resources: [
              { name: "Micro-frontends Guide", type: "Article" },
              { name: "Serverless Framework", type: "Course" },
              { name: "Advanced React Patterns", type: "Tutorial" },
            ],
            projects: ["Micro-frontend implementation"],
          },
          {
            title: "Phase 2: Performance and Scalability",
            duration: "Month 2",
            description:
              "Optimize web applications for performance and scalability",
            skills: [
              "Web Performance Optimization",
              "Load Testing",
              "Caching Strategies",
            ],
            resources: [
              { name: "Web Performance Guide", type: "Article" },
              { name: "Load Testing with JMeter", type: "Course" },
              { name: "Caching Strategies Tutorial", type: "Tutorial" },
            ],
            projects: ["Optimize a web app for performance"],
          },
          {
            title: "Phase 3: Advanced Backend Integration",
            duration: "Month 3",
            description: "Integrate advanced backend technologies and APIs",
            skills: ["GraphQL", "WebSockets", "API Security"],
            resources: [
              { name: "GraphQL with Apollo", type: "Course" },
              { name: "WebSockets Tutorial", type: "Tutorial" },
              { name: "API Security Best Practices", type: "Article" },
            ],
            projects: ["Real-time web application with WebSockets"],
          },
        ];

        if (timelineMonths >= 6) {
          phases.push({
            title: "Phase 4: DevOps and Deployment",
            duration: "Months 4-6",
            description:
              "Master DevOps practices and cloud deployment for web applications",
            skills: [
              "CI/CD",
              "Containerization",
              "Cloud Deployment",
              "Monitoring",
            ],
            resources: [
              { name: "CI/CD with GitHub Actions", type: "Course" },
              { name: "Docker for Web Developers", type: "Tutorial" },
              { name: "AWS Deployment Guide", type: "Tutorial" },
            ],
            projects: ["Set up a CI/CD pipeline", "Deploy a web app to AWS"],
          });
        }
      }
    } else if (career === "ai-engineer") {
      if (experience === "none" || experience === "beginner") {
        phases = [
          {
            title: "Phase 1: Programming and Math Foundations",
            duration: "Month 1",
            description:
              "Build essential programming and mathematical skills for AI",
            skills: ["Python", "Linear Algebra", "Probability", "Statistics"],
            resources: [
              { name: "Python Crash Course", type: "Book" },
              { name: "Khan Academy: Linear Algebra", type: "Course" },
              { name: "Probability for AI", type: "Tutorial" },
            ],
            projects: ["Basic Python data processing script"],
          },
          {
            title: "Phase 2: Machine Learning Basics",
            duration: "Month 2",
            description: "Learn core machine learning concepts and algorithms",
            skills: [
              "Scikit-learn",
              "Supervised Learning",
              "Unsupervised Learning",
            ],
            resources: [
              { name: "Machine Learning Crash Course", type: "Course" },
              { name: "Scikit-learn Documentation", type: "Resource" },
              { name: "Kaggle Learn", type: "Tutorial" },
            ],
            projects: ["Simple ML model", "Clustering project"],
          },
          {
            title: "Phase 3: Deep Learning Introduction",
            duration: "Month 3",
            description: "Understand neural networks and deep learning basics",
            skills: ["TensorFlow", "Neural Networks", "Computer Vision Basics"],
            resources: [
              { name: "Deep Learning with Python", type: "Book" },
              { name: "TensorFlow Tutorials", type: "Tutorial" },
              { name: "Intro to Computer Vision", type: "Course" },
            ],
            projects: ["Image classification model", "Simple neural network"],
          },
        ];

        if (timelineMonths >= 6) {
          phases.push({
            title: "Phase 4: Advanced AI Techniques",
            duration: "Months 4-6",
            description: "Learn advanced AI and deep learning techniques",
            skills: [
              "NLP",
              "Reinforcement Learning",
              "GANs",
              "Model Optimization",
            ],
            resources: [
              { name: "NLP with Transformers", type: "Course" },
              { name: "Reinforcement Learning Guide", type: "Book" },
              { name: "GANs Tutorial", type: "Tutorial" },
            ],
            projects: [
              "Chatbot implementation",
              "Reinforcement learning agent",
            ],
          });
        }

        if (timelineMonths >= 12) {
          phases.push({
            title: "Phase 5: AI Deployment and Specialization",
            duration: "Months 7-12",
            description:
              "Master AI model deployment and specialize in an AI domain",
            skills: [
              "MLOps",
              "Cloud AI Services",
              "Domain-Specific AI",
              "Ethics in AI",
            ],
            resources: [
              { name: "MLOps with Kubernetes", type: "Course" },
              { name: "AWS AI Services", type: "Tutorial" },
              { name: "AI Ethics Principles", type: "Article" },
            ],
            projects: ["Deployed AI model", "Domain-specific AI application"],
          });
        }
      } else if (experience === "intermediate" || experience === "advanced") {
        phases = [
          {
            title: "Phase 1: Advanced AI Systems",
            duration: "Month 1",
            description:
              "Master advanced AI architectures and deployment strategies",
            skills: ["Transformers", "Federated Learning", "AI Scalability"],
            resources: [
              { name: "Transformers for NLP", type: "Course" },
              { name: "Federated Learning Guide", type: "Article" },
              { name: "Scalable AI Systems", type: "Book" },
            ],
            projects: ["Advanced transformer model implementation"],
          },
          {
            title: "Phase 2: Specialized AI Domains",
            duration: "Month 2",
            description:
              "Deepen expertise in specific AI domains like NLP or computer vision",
            skills: ["Advanced NLP", "Computer Vision", "Time Series Analysis"],
            resources: [
              { name: "Advanced NLP Techniques", type: "Course" },
              { name: "Computer Vision with OpenCV", type: "Tutorial" },
              { name: "Time Series Analysis Guide", type: "Article" },
            ],
            projects: ["Advanced NLP or CV project"],
          },
          {
            title: "Phase 3: AI Optimization",
            duration: "Month 3",
            description: "Optimize AI models for performance and efficiency",
            skills: [
              "Model Compression",
              "Quantization",
              "Efficient Inference",
            ],
            resources: [
              { name: "Model Compression Techniques", type: "Article" },
              { name: "Quantization Tutorial", type: "Tutorial" },
              { name: "Efficient Inference Guide", type: "Course" },
            ],
            projects: ["Optimize an AI model for edge deployment"],
          },
        ];

        if (timelineMonths >= 6) {
          phases.push({
            title: "Phase 4: Production AI Systems",
            duration: "Months 4-6",
            description: "Master production-ready AI systems and deployment",
            skills: [
              "MLOps",
              "Model Monitoring",
              "Cloud AI Deployment",
              "AI Governance",
            ],
            resources: [
              { name: "MLOps with MLflow", type: "Course" },
              { name: "Model Monitoring Best Practices", type: "Article" },
              { name: "Google Cloud AI Tutorial", type: "Tutorial" },
            ],
            projects: [
              "Deploy a production-ready AI system",
              "Set up AI monitoring pipeline",
            ],
          });
        }
      }
    } else if (career === "data-analyst") {
      if (experience === "none" || experience === "beginner") {
        phases = [
          {
            title: "Phase 1: Data Analysis Fundamentals",
            duration: "Month 1",
            description:
              "Learn core data analysis tools and statistical concepts",
            skills: ["Excel", "SQL", "Basic Statistics", "Data Cleaning"],
            resources: [
              { name: "Excel for Data Analysis", type: "Course" },
              { name: "SQL for Data Analysis", type: "Tutorial" },
              { name: "Statistics Basics", type: "Book" },
            ],
            projects: ["Excel data analysis", "SQL query project"],
          },
          {
            title: "Phase 2: Data Visualization",
            duration: "Month 2",
            description:
              "Master data visualization tools and storytelling techniques",
            skills: [
              "Tableau",
              "Power BI",
              "Python Visualization",
              "Storytelling",
            ],
            resources: [
              { name: "Tableau Public Tutorials", type: "Tutorial" },
              { name: "Power BI Crash Course", type: "Course" },
              { name: "Data Storytelling Guide", type: "Article" },
            ],
            projects: ["Interactive dashboard", "Data story presentation"],
          },
          {
            title: "Phase 3: Advanced Analytics",
            duration: "Month 3",
            description: "Learn advanced analytical techniques and programming",
            skills: ["Python", "Pandas", "A/B Testing", "Correlation Analysis"],
            resources: [
              { name: "Python for Data Analysis", type: "Book" },
              { name: "Pandas Documentation", type: "Resource" },
              { name: "A/B Testing Guide", type: "Course" },
            ],
            projects: ["Python-based analysis", "A/B test implementation"],
          },
        ];

        if (timelineMonths >= 6) {
          phases.push({
            title: "Phase 4: Business Intelligence",
            duration: "Months 4-6",
            description:
              "Develop skills in business intelligence and advanced reporting",
            skills: [
              "Advanced SQL",
              "ETL Processes",
              "Business Metrics",
              "Forecasting",
            ],
            resources: [
              { name: "Advanced SQL for Analysts", type: "Course" },
              { name: "ETL Fundamentals", type: "Tutorial" },
              { name: "Business Metrics Guide", type: "Article" },
            ],
            projects: ["BI dashboard", "Forecasting model"],
          });
        }

        if (timelineMonths >= 12) {
          phases.push({
            title: "Phase 5: Data Strategy and Communication",
            duration: "Months 7-12",
            description: "Master data strategy and stakeholder communication",
            skills: [
              "Data Governance",
              "Stakeholder Management",
              "Advanced Visualization",
              "Data Strategy",
            ],
            resources: [
              { name: "Data Governance Framework", type: "Course" },
              { name: "Stakeholder Communication", type: "Book" },
              { name: "Advanced Visualization Techniques", type: "Tutorial" },
            ],
            projects: [
              "Data strategy proposal",
              "Executive-level data presentation",
            ],
          });
        }
      } else if (experience === "intermediate" || experience === "advanced") {
        phases = [
          {
            title: "Phase 1: Advanced Data Analysis",
            duration: "Month 1",
            description: "Master advanced analytical techniques and automation",
            skills: [
              "Advanced Python",
              "Automated Reporting",
              "Big Data Analytics",
            ],
            resources: [
              { name: "Advanced Python for Data Analysis", type: "Course" },
              { name: "Automated Reporting Guide", type: "Tutorial" },
              { name: "Big Data Analytics", type: "Book" },
            ],
            projects: ["Automated reporting system"],
          },
          {
            title: "Phase 2: Advanced Visualization",
            duration: "Month 2",
            description:
              "Create advanced visualizations and interactive dashboards",
            skills: ["Advanced Tableau", "D3.js", "Interactive Dashboards"],
            resources: [
              { name: "Advanced Tableau Techniques", type: "Course" },
              { name: "D3.js Tutorial", type: "Tutorial" },
              { name: "Interactive Dashboard Guide", type: "Article" },
            ],
            projects: ["Complex interactive dashboard"],
          },
          {
            title: "Phase 3: Predictive Analytics",
            duration: "Month 3",
            description: "Learn predictive modeling and forecasting techniques",
            skills: [
              "Time Series Analysis",
              "Predictive Modeling",
              "Statistical Modeling",
            ],
            resources: [
              { name: "Time Series Analysis with Python", type: "Course" },
              { name: "Predictive Modeling Guide", type: "Article" },
              { name: "Statistical Modeling Tutorial", type: "Tutorial" },
            ],
            projects: ["Predictive analytics project"],
          },
        ];

        if (timelineMonths >= 6) {
          phases.push({
            title: "Phase 4: Data Strategy and Governance",
            duration: "Months 4-6",
            description: "Develop expertise in data strategy and governance",
            skills: [
              "Data Governance",
              "Data Quality",
              "Stakeholder Engagement",
              "Data Ethics",
            ],
            resources: [
              { name: "Data Governance Framework", type: "Course" },
              { name: "Data Quality Best Practices", type: "Article" },
              { name: "Data Ethics Guide", type: "Book" },
            ],
            projects: [
              "Data governance plan",
              "Stakeholder data strategy presentation",
            ],
          });
        }
      }
    } else if (career === "project-manager") {
      if (experience === "none" || experience === "beginner") {
        phases = [
          {
            title: "Phase 1: Project Management Fundamentals",
            duration: "Month 1",
            description:
              "Learn the basics of project management methodologies and tools",
            skills: [
              "Project Lifecycle",
              "Scope Management",
              "Time Management",
              "Basic Agile",
            ],
            resources: [
              { name: "Introduction to Project Management", type: "Course" },
              { name: "The Project Management Book", type: "Book" },
              { name: "PM Fundamentals", type: "Tutorial" },
            ],
            projects: [
              "Create a project charter",
              "Develop a simple project plan",
            ],
          },
          {
            title: "Phase 2: Agile and Team Management",
            duration: "Month 2",
            description:
              "Master agile methodologies and team leadership skills",
            skills: [
              "Scrum",
              "Kanban",
              "Team Leadership",
              "Stakeholder Management",
            ],
            resources: [
              { name: "Agile Project Management", type: "Course" },
              { name: "Scrum Guide", type: "Resource" },
              { name: "Stakeholder Management Techniques", type: "Article" },
            ],
            projects: [
              "Run a mock sprint",
              "Create a stakeholder management plan",
            ],
          },
          {
            title: "Phase 3: Tools and Documentation",
            duration: "Month 3",
            description:
              "Learn project management tools and documentation practices",
            skills: ["JIRA", "MS Project", "Documentation", "Risk Management"],
            resources: [
              { name: "JIRA for Project Managers", type: "Tutorial" },
              { name: "Risk Management Fundamentals", type: "Course" },
              { name: "Effective Project Documentation", type: "Article" },
            ],
            projects: [
              "Set up a project in JIRA/Trello",
              "Create a risk register",
            ],
          },
        ];

        if (timelineMonths >= 6) {
          phases.push({
            title: "Phase 4: Advanced Project Management",
            duration: "Months 4-6",
            description:
              "Develop advanced skills in project budgeting and strategic alignment",
            skills: [
              "Budgeting",
              "Resource Allocation",
              "Strategic Alignment",
              "Advanced Risk Management",
            ],
            resources: [
              { name: "Project Budgeting and Finance", type: "Course" },
              { name: "Strategic Project Management", type: "Book" },
              { name: "Advanced Risk Management Techniques", type: "Article" },
            ],
            projects: [
              "Create a project budget",
              "Develop a resource allocation plan",
            ],
          });
        }

        if (timelineMonths >= 12) {
          phases.push({
            title: "Phase 5: Certification and Specialization",
            duration: "Months 7-12",
            description:
              "Prepare for professional certification and specialize in your industry",
            skills: [
              "PMP Preparation",
              "Industry-Specific Knowledge",
              "Program Management",
              "Portfolio Management",
            ],
            resources: [
              { name: "PMP Certification Guide", type: "Course" },
              { name: "Industry Case Studies", type: "Resource" },
              { name: "Program Management Principles", type: "Book" },
            ],
            projects: ["PMP practice exams", "Industry-specific project plan"],
          });
        }
      } else if (experience === "intermediate" || experience === "advanced") {
        phases = [
          {
            title: "Phase 1: Advanced Methodologies",
            duration: "Month 1",
            description: "Master advanced project management methodologies",
            skills: [
              "Hybrid Methodologies",
              "Scaled Agile",
              "Six Sigma",
              "Critical Chain",
            ],
            resources: [
              {
                name: "Advanced Project Management Methodologies",
                type: "Book",
              },
              { name: "Scaled Agile Framework", type: "Course" },
              { name: "Six Sigma for Project Managers", type: "Course" },
            ],
            projects: ["Implement a hybrid methodology on a mock project"],
          },
          {
            title: "Phase 2: Strategic Project Management",
            duration: "Month 2",
            description:
              "Align projects with organizational strategy and goals",
            skills: [
              "Strategic Alignment",
              "Portfolio Management",
              "Benefits Realization",
            ],
            resources: [
              { name: "Strategic Project Management", type: "Book" },
              { name: "Portfolio Management Guide", type: "Course" },
              { name: "Benefits Realization Techniques", type: "Article" },
            ],
            projects: ["Develop a strategic project alignment plan"],
          },
          {
            title: "Phase 3: Advanced Risk and Change Management",
            duration: "Month 3",
            description:
              "Master advanced risk and change management techniques",
            skills: [
              "Advanced Risk Management",
              "Change Management",
              "Crisis Management",
            ],
            resources: [
              { name: "Advanced Risk Management", type: "Course" },
              { name: "Change Management Guide", type: "Article" },
              { name: "Crisis Management for PMs", type: "Tutorial" },
            ],
            projects: ["Create an advanced risk management plan"],
          },
        ];

        if (timelineMonths >= 6) {
          phases.push({
            title: "Phase 4: Program and Portfolio Management",
            duration: "Months 4-6",
            description:
              "Develop expertise in managing programs and portfolios",
            skills: [
              "Program Management",
              "Portfolio Optimization",
              "Governance Frameworks",
              "Stakeholder Engagement",
            ],
            resources: [
              { name: "Program Management Principles", type: "Book" },
              { name: "Portfolio Management Course", type: "Course" },
              { name: "Governance Frameworks Guide", type: "Article" },
            ],
            projects: [
              "Design a program management framework",
              "Optimize a project portfolio",
            ],
          });
        }
      }
    }

    if (learningStyle === "hands-on") {
      phases = phases.map((phase) => ({
        ...phase,
        projects: [...phase.projects, "Additional hands-on project"],
        resources: [
          ...phase.resources.filter(
            (r) => r.type === "Practice" || r.type === "Project"
          ),
        ],
      }));
    } else if (learningStyle === "theoretical") {
      phases = phases.map((phase) => ({
        ...phase,
        resources: [
          ...phase.resources.filter(
            (r) =>
              r.type === "Book" || r.type === "Course" || r.type === "Article"
          ),
        ],
      }));
    }

    return {
      title: `${timelineMonths}-Month Roadmap to Becoming a ${
        careerOptions.find((c) => c.id === career)?.name
      }`,
      description: `Personalized learning path for ${
        currentUser?.displayName || "you"
      } based on your goals and preferences.`,
      career: careerOptions.find((c) => c.id === career)?.name,
      timeline: timelineOptions.find((t) => t.id === timeline)?.name,
      experience: experienceOptions.find((e) => e.id === priorExperience)?.name,
      learningStyle: learningStyleOptions.find((s) => s.id === learningStyle)
        ?.name,
      phases: phases,
      nextSteps: [
        "Set specific weekly learning goals",
        "Join communities related to your chosen field",
        "Find a mentor or study buddy",
        "Track your progress regularly",
      ],
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            AI Learning Roadmap
          </h1>
          <p className="text-lg text-blue-100">
            Get a personalized learning path based on your goals
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                    currentStep >= step ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  {step}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {step === 1 && "Career"}
                  {step === 2 && "Timeline"}
                  {step === 3 && "Details"}
                  {step === 4 && "Results"}
                </div>
              </div>
            ))}
          </div>
          <div className="relative mt-2">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200"></div>
            <div
              className="absolute top-0 left-0 h-1 bg-blue-600 transition-all"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                What career path are you interested in?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {careerOptions.map((option) => (
                  <button
                    key={option.id}
                    className={`p-4 border rounded-lg text-left hover:border-blue-500 transition-all ${
                      career === option.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                    onClick={() => {
                      setCareer(option.id);
                      setError("");
                    }}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          career === option.id
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {option.icon}
                      </div>
                      <span className="ml-3 font-medium">{option.name}</span>
                    </div>
                  </button>
                ))}
              </div>

              {career === "other" && (
                <div>
                  <label
                    htmlFor="customCareer"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Specify your career path
                  </label>
                  <input
                    type="text"
                    id="customCareer"
                    name="customCareer"
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. UX Designer, DevOps Engineer"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                  />
                </div>
              )}

              <div className="flex justify-end mt-6">
                <Button
                  onClick={handleNextStep}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                How long do you want your learning journey to be?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {timelineOptions.map((option) => (
                  <button
                    key={option.id}
                    className={`p-4 border rounded-lg text-left hover:border-blue-500 transition-all ${
                      timeline === option.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                    onClick={() => {
                      setTimeline(option.id);
                      setError("");
                    }}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          timeline === option.id
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {option.icon}
                      </div>
                      <span className="ml-3 font-medium">{option.name}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between mt-6">
                <Button
                  variant="secondary"
                  onClick={handlePreviousStep}
                  className="bg-gray-200 hover:bg-gray-300"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNextStep}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Additional Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prior Experience Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {experienceOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`px-4 py-2 border rounded-md text-sm ${
                        priorExperience === option.id
                          ? "bg-blue-50 border-blue-500 text-blue-700"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => setPriorExperience(option.id)}
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Learning Style
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {learningStyleOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`px-4 py-2 border rounded-md text-sm ${
                        learningStyle === option.id
                          ? "bg-blue-50 border-blue-500 text-blue-700"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => setLearningStyle(option.id)}
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button
                  variant="secondary"
                  onClick={handlePreviousStep}
                  className="bg-gray-200 hover:bg-gray-300"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate Roadmap <Rocket className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {currentStep === 4 && roadmap && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {roadmap.title}
                </h2>
                <p className="text-gray-600">{roadmap.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center text-blue-700 mb-2">
                    <School className="w-5 h-5 mr-2" />
                    <span className="font-medium">Career Path</span>
                  </div>
                  <p>{roadmap.career}</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center text-blue-700 mb-2">
                    <Clock className="w-5 h-5 mr-2" />
                    <span className="font-medium">Timeline</span>
                  </div>
                  <p>{roadmap.timeline}</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center text-blue-700 mb-2">
                    <BookOpen className="w-5 h-5 mr-2" />
                    <span className="font-medium">Experience Level</span>
                  </div>
                  <p>{roadmap.experience}</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center text-blue-700 mb-2">
                    <Lightbulb className="w-5 h-5 mr-2" />
                    <span className="font-medium">Learning Style</span>
                  </div>
                  <p>{roadmap.learningStyle}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Map className="w-5 h-5 mr-2" /> Learning Roadmap
                </h3>

                <div className="space-y-6">
                  {roadmap.phases.map((phase, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <h4 className="text-lg font-semibold text-blue-700 mb-2">
                        {phase.title}
                      </h4>
                      <div className="text-sm text-blue-600 mb-2">
                        {phase.duration}
                      </div>
                      <p className="text-gray-600 mb-3">{phase.description}</p>

                      <div className="mb-3">
                        <div className="font-medium text-gray-700 mb-1">
                          Skills to Learn:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {phase.skills.map((skill, i) => (
                            <span
                              key={i}
                              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="font-medium text-gray-700 mb-1">
                          Recommended Resources:
                        </div>
                        <ul className="list-disc pl-5 text-gray-600">
                          {phase.resources.map((resource, i) => (
                            <li key={i}>
                              {resource.name}{" "}
                              <span className="text-gray-400 text-sm">
                                ({resource.type})
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="font-medium text-gray-700 mb-1">
                          Projects:
                        </div>
                        <ul className="list-disc pl-5 text-gray-600">
                          {phase.projects.map((project, i) => (
                            <li key={i}>{project}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <h1>
                Note: Intermediate and Advanced sections are capped to 6 month
                timeline
              </h1>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Next Steps
                </h3>
                <ul className="list-disc pl-5 text-gray-600">
                  {roadmap.nextSteps.map((step, index) => (
                    <li key={index} className="mb-1">
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap justify-center gap-4 pt-6">
                <Button
                  onClick={() => {
                    setCurrentStep(1);
                    setRoadmap(null);
                    setCareer("");
                    setTimeline("");
                    setPriorExperience("none");
                    setLearningStyle("balanced");
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Create Another Roadmap
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoadmapGenerator;
