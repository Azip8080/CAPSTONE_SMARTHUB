
import { useNavigate } from "react-router-dom";
import "./Home.css";
import clocktower from "../assets/clocktower.png";
import SDGCharts from "../components/SDGCharts/SDGCharts";
import SummaryCards from "../components/SummaryCards";
import BarangayContributionRanking from "../components/BarangayContributionRanking";
import AuthGate from "../components/AuthGate";

function Home() {
  const navigate = useNavigate();

  return (
    <main className="Home">
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

      <AuthGate>
        <section className="protected-section">
          {/* SDG Analytics now appears first */}
          <section id="analytics" className="home-analytics-section">
            <SDGCharts />
          </section>

          {/* Summary cards appear below analytics */}
          <section className="home-summary-section">
            <SummaryCards />
          </section>

          {/* Barangay contributions appear below the summaries */}
          <section className="barangay-ranking-section">
            <BarangayContributionRanking />
          </section>
        </section>
      </AuthGate>
    </main>
  );
}

export default Home;
