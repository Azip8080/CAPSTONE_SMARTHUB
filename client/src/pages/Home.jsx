import "./Home.css";
import SDGCharts from "../components/SDGCharts/SDGCharts";
import SummaryCards from "../components/SummaryCards";

function Home() {
  return (
    <main className="Home">
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="hero-eyebrow">
            Sustainable Development City of Manila
          </p>

          <h1 className="hero-title">SDG Smart Hub</h1>

          <p className="hero-subtitle">
            Connecting communities with sustainable projects, events, and
            educational resources.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn">Explore Projects</button>
            <button className="secondary-btn">Learn More</button>
          </div>
        </div>
      </section>

    
      <SummaryCards />

      <SDGCharts />
    </main>
  );
}

export default Home;