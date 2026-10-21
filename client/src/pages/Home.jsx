import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

import SDGCharts from "../components/SDGCharts/SDGCharts";
import SummaryCards from "../components/SummaryCards";
import BarangayContributionRanking from "../components/BarangayContributionRanking";

function Home() {
  const navigate = useNavigate();

  const [isSignedIn, setIsSignedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );

  useEffect(() => {
    const checkLogin = () => {
      setIsSignedIn(Boolean(localStorage.getItem("token")));
    };

    window.addEventListener("storage", checkLogin);
    window.addEventListener("userUpdated", checkLogin);

    return () => {
      window.removeEventListener("storage", checkLogin);
      window.removeEventListener("userUpdated", checkLogin);
    };
  }, []);

  const handleSignIn = () => {
    navigate("/login");
  };

  return (
    <main className="Home">
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-overlay" />

        <div className="hero-content">
          <p className="hero-eyebrow">
            Sustainable Development City of Manila
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
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
            aria-label="Scroll to SDG Analytics"
          >
            <span>Explore Analytics</span>
            <span className="scroll-down-icon">↓</span>
          </button>
        </div>
      </section>

      {/* Protected community data */}
      <section className="protected-section">
        <div
          className={
            !isSignedIn
              ? "protected-content blurred"
              : "protected-content"
          }
        >
          <SummaryCards />

          <section className="barangay-ranking-section">
            <BarangayContributionRanking />
          </section>

          <div id="analytics">
            <SDGCharts />
          </div>
        </div>

        {!isSignedIn && (
          <div className="login-overlay">
            <div className="login-overlay-card">
              <div className="login-lock-icon">
                🔒
              </div>

              <span className="login-overlay-eyebrow">
                COMMUNITY DATA
              </span>

              <h2>
                Sign in to view community data
              </h2>

              <p>
                Sign in to access SDG analytics, barangay
                contributions, project statistics, and
                community participation data.
              </p>

              <button
                type="button"
                className="login-overlay-btn"
                onClick={handleSignIn}
              >
                Sign in to continue
              </button>

              <button
                type="button"
                className="login-overlay-link"
                onClick={() => navigate("/signup")}
              >
                Don't have an account? Create one
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default Home;