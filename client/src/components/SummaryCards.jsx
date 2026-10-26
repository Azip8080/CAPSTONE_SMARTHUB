
import { useCallback, useEffect, useState } from "react";
import { fetchDashboardSummary } from "../api/analyticsAPI";
import styles from "./SummaryCards.module.css";

const INITIAL_SUMMARY = {
  totalProjects: 0,
  activeGoals: 0,
  communities: 0,
  thisYear: 0,
  totalEvents: 0,
  barangay: "",
};

export default function SummaryCards() {
  const [summary, setSummary] = useState(INITIAL_SUMMARY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState(
    () => Boolean(localStorage.getItem("token"))
  );

  const loadSummary = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoggedIn(false);
      setSummary(INITIAL_SUMMARY);
      setError("");
      setLoading(false);
      return;
    }

    setLoggedIn(true);
    setLoading(true);
    setError("");

    try {
      const data = await fetchDashboardSummary();

      setSummary({
        ...INITIAL_SUMMARY,
        ...data,
      });
    } catch (err) {
      setError(
        err.message || "Unable to load the dashboard summary."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();

    const handleUserUpdated = () => {
      loadSummary();
    };

    const handleStorage = (event) => {
      if (event.key === "token") {
        loadSummary();
      }
    };

    window.addEventListener("userUpdated", handleUserUpdated);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("userUpdated", handleUserUpdated);
      window.removeEventListener("storage", handleStorage);
    };
  }, [loadSummary]);

  if (!loggedIn) {
    return (
      <section className={styles.summarySection}>
        <div className={styles.summaryContainer}>
          <p className={styles.loadingText}>
            Log in to view dashboard analytics.
          </p>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className={styles.summarySection}>
        <div className={styles.summaryContainer}>
          <p className={styles.loadingText}>
            Loading dashboard summary...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.summarySection}>
        <div className={styles.summaryContainer}>
          <p role="alert">{error}</p>
          <button type="button" onClick={loadSummary}>
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      className={styles.summarySection}
      aria-label="Dashboard summary"
    >
      <div className={styles.summaryContainer}>
        {summary.barangay &&
          summary.barangay !== "All Barangays" && (
            <p className={styles.loadingText}>
              Showing results for {summary.barangay}
            </p>
          )}

        <div className={styles.summaryCard}>
          <h2>{summary.totalProjects}</h2>
          <h4>TOTAL PROJECTS</h4>
          <p>Published projects in your barangay</p>
        </div>

        <div className={styles.summaryCard}>
          <h2>{summary.activeGoals}</h2>
          <h4>ACTIVE GOALS</h4>
          <p>SDGs represented by published projects</p>
        </div>

        <div className={styles.summaryCard}>
          <h2>{summary.communities}</h2>
          <h4>COMMUNITIES</h4>
          <p>Barangays represented in the results</p>
        </div>

        <div className={styles.summaryCard}>
          <h2>+{summary.thisYear}</h2>
          <h4>THIS YEAR</h4>
          <p>Projects published this year</p>
        </div>
      </div>
    </section>
  );
}
