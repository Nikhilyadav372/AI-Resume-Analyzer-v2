import { Link } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  return (
    <div className="home">

      <div className="hero">

        <h1>🤖 AI Resume Analyzer</h1>

        <p>
          Analyze your Resume with AI, Improve ATS Score,
          Match Jobs and Prepare for Interviews.
        </p>

        <div className="hero-buttons">

          <Link to="/login">
            <button className="primary-btn">
              Login
            </button>
          </Link>

          <Link to="/register">
            <button className="secondary-btn">
              Register
            </button>
          </Link>

        </div>

      </div>

      <div className="features">

        <div className="feature-card">
          <h2>📄 Resume Analysis</h2>
          <p>
            Upload your resume and get detailed AI feedback.
          </p>
        </div>

        <div className="feature-card">
          <h2>📊 ATS Score</h2>
          <p>
            Check how ATS-friendly your resume is.
          </p>
        </div>

        <div className="feature-card">
          <h2>💼 Job Match</h2>
          <p>
            Compare your resume with Job Descriptions.
          </p>
        </div>

        <div className="feature-card">
          <h2>🎤 Interview Prep</h2>
          <p>
            Generate AI-powered interview questions.
          </p>
        </div>

      </div>

    </div>
  );
}

export default Home;