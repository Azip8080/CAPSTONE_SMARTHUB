
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Home.css";

import clocktower from "../assets/clocktower.png";
import SDGCharts from "../components/SDGCharts/SDGCharts";
import SummaryCards from "../components/SummaryCards";
import BarangayContributionRanking from "../components/BarangayContributionRanking";

function getCurrentUser() {
  try {
    const storedUser =
      localStorage.getItem("user") ||
      localStorage.getItem("currentUser");

    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(getCurrentUser);

  useEffect(() => {
    setUser(getCurrentUser());

    const updateUser = () => {
      setUser(getCurrentUser());
    };

    window.addEventListener("storage", updateUser);
    window.addEventListener("authChange", updateUser);

    return () => {
      window.removeEventListener("storage", updateUser);
      window.removeEventListener("authChange", updateUser);
    };
  }, [location]);

  const isBarangayPersonnel =
    user?.role === "barangay_personnel";

  return (
    <main className="Home">
      {/* Hero Section */}
      <section className="hero">
        <div
          className="hero-bg"
          style={{ backgroundImage: `url(${clocktower})` }}
        />
        <div className="hero-overlay" />

        <div className="hero-content">
          <p className="hero-eyebrow">
            Empowering Communities. Advancing Sustainability.
          </p>

          <h1 className="hero-title">
            SDG Smart Hub
          </h1>

          <p className="hero-subtitle">
            Connecting communities with sustainable
            projects, events, and educational resources.
          </p>

          <div className="hero-buttons">
            <button
              type="button"
              className="primary-btn"
              onClick={() => navigate("/highlights")}
            >
              Explore Projects
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={() => navigate("/about")}
            >
              Learn More
            </button>
          </div>

          <button
            type="button"
            className="scroll-down-btn"
            onClick={() =>
              document
                .getElementById("analytics")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            aria-label="Scroll to SDG Analytics"
          >
            <span>Explore Analytics</span>
            <span className="scroll-down-icon">↓</span>
          </button>
        </div>
      </section>

      {/* Barangay Personnel Quick Actions */}
      {isBarangayPersonnel && (
        <section className="personnel-quick-section">
          <div className="personnel-welcome">
            <div className="welcome-icon">📢</div>

            <p>
              Welcome back,{" "}
              <strong>
                {user?.fullName || user?.name || "Barangay Personnel"}
              </strong>
              ! Let's build a more sustainable community together.
            </p>

            <span className="personnel-badge">
              Barangay Personnel
            </span>
          </div>

          <div className="quick-actions-heading">
            <h2>Quick Actions</h2>
            <p>
              Manage your barangay's projects and community events.
            </p>
          </div>

          <div className="quick-actions-grid">
            <button
              type="button"
              className="quick-action-card project-action"
              onClick={() => navigate("/submit-project")}
            >
              <span className="quick-action-icon">📁</span>

              <span className="quick-action-content">
                <strong>Submit Project</strong>
                <small>
                  Share a new barangay project that supports the SDGs.
                </small>
              </span>

              <span className="quick-action-arrow">→</span>
            </button>

            <button
              type="button"
              className="quick-action-card event-action"
              onClick={() => navigate("/submit-event")}
            >
              <span className="quick-action-icon">📅</span>

              <span className="quick-action-content">
                <strong>Submit Event</strong>
                <small>
                  Post an upcoming community event or activity.
                </small>
              </span>

              <span className="quick-action-arrow">→</span>
            </button>

            <button
              type="button"
              className="quick-action-card submissions-action"
              onClick={() => navigate("/my-submissions")}
            >
              <span className="quick-action-icon">📋</span>

              <span className="quick-action-content">
                <strong>My Submissions</strong>
                <small>
                  Track the status of your submitted projects and events.
                </small>
              </span>

              <span className="quick-action-arrow">→</span>
            </button>
          </div>
        </section>
      )}

      {/* Publicly Accessible Homepage Sections */}
      <section className="public-section">
        <section id="analytics" className="home-analytics-section">
          <SDGCharts />
        </section>

        <section className="home-summary-section">
          <SummaryCards />
        </section>

        <section className="barangay-ranking-section">
          <BarangayContributionRanking />
        </section>
      </section>
    </main>
  );
}

export default Home;
