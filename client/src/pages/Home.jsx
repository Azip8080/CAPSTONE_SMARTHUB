import "./Home.css";
import SDGCharts from "../components/SDGCharts";

function Home() {
  return (
    <main className="Home">

      <section className="hero">
        <p className="hero-eyebrow">Sustainable Development City of Manila</p>
        <h1 className="hero-title">SDG Smart Hub</h1>
        <p className="hero-subtitle">
          Connecting communities with sustainable projects, events, and
          educational resources.
        </p>
        <div className="hero-buttons">
          <button className="primary-btn">Explore Projects</button>
          <button className="secondary-btn">Learn More</button>
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-label">Total projects</p>
            <p className="stat-value">847</p>
            <p className="stat-sub">Across 17 SDGs</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Active goals</p>
            <p className="stat-value">17</p>
            <p className="stat-sub">All SDGs covered</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Communities</p>
            <p className="stat-value">124</p>
            <p className="stat-sub">Engaged barangays</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">This year</p>
            <p className="stat-value">+38</p>
            <p className="stat-sub">New projects</p>
          </div>
        </div>
      </section>

      <SDGCharts />

    </main>
  );
}

export default Home;