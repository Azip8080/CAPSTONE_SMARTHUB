import { useEffect, useState } from "react";
import { fetchDashboardSummary } from "../api/analyticsAPI";
import "./SummaryCards.css";

export default function SummaryCards() {
  const [summary, setSummary] = useState({
    totalProjects: 0,
    activeGoals: 0,
    communities: 0,
    thisYear: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const data = await fetchDashboardSummary();
        setSummary(data);
      } catch (error) {
        console.error("Error fetching dashboard summary:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  if (loading) {
    return (
      <section className="summary-container">
        <p>Loading dashboard summary...</p>
      </section>
    );
  }

  return (
    <section className="summary-container">

      <div className="summary-card">
        <h2>{summary.totalProjects}</h2>
        <h4>TOTAL PROJECTS</h4>
        <p>Across {summary.activeGoals} SDGs</p>
      </div>

      <div className="summary-card">
        <h2>{summary.activeGoals}</h2>
        <h4>ACTIVE GOALS</h4>
        <p>All SDGs covered</p>
      </div>

      <div className="summary-card">
        <h2>{summary.communities}</h2>
        <h4>COMMUNITIES</h4>
        <p>Engaged barangays</p>
      </div>

      <div className="summary-card">
        <h2>+{summary.thisYear}</h2>
        <h4>THIS YEAR</h4>
        <p>New projects</p>
      </div>

    </section>
  );
}