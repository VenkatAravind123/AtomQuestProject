import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="landing-navbar">
        <div className="landing-nav-container">
          <h1 className="landing-logo">🎯 AtomQuest</h1>
          <button
            className="landing-btn landing-btn-primary"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <h2>Goal Setting & Tracking Portal</h2>
          <p>
            Align your team around strategic goals. Set objectives, track
            progress, and celebrate wins together.
          </p>
          <button
            className="landing-btn landing-btn-large"
            onClick={() => navigate("/login")}
          >
            Get Started →
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <h3>Key Features</h3>
        <div className="landing-features-grid">
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h4>Goal Creation</h4>
            <p>Set clear, measurable goals with weightage and timelines</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h4>Approval Workflow</h4>
            <p>Manager review and approval process for alignment</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h4>Progress Tracking</h4>
            <p>Quarterly updates and real-time progress monitoring</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h4>Check-ins</h4>
            <p>Manager feedback and actionable insights for each goal</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h4>Shared Goals</h4>
            <p>Push departmental KPIs to multiple team members</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h4>Analytics</h4>
            <p>Comprehensive reports and performance dashboards</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>&copy; 2026 AtomQuest. Built for teams that achieve together.</p>
      </footer>
    </div>
  );
}