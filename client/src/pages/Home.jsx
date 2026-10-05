import { useNavigate } from "react-router-dom";
import "./Home.css";
import SDGCharts from "../components/SDGCharts/SDGCharts";
import SummaryCards from "../components/SummaryCards";

function Home() {
  const navigate = useNavigate();

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
              onClick={() =>
                navigate("/highlights")
              }
            >
              Explore Projects
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={() =>
                navigate("/about")
              }
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
            <span className="scroll-down-icon">
              ↓
            </span>
          </button>
        </div>
      </section>

      <SummaryCards />

      <div id="analytics">
        <SDGCharts />
      </div>
    </main>
  );
}

export default Home;