import { useState, useEffect } from "react";
import styles from "./Reports.module.css";
import { api } from "../../services/api";
import StatsGrid from "./StatsGrid.jsx";
import RangeToolbar from "./RangeToolbar.jsx";
import BarChart from "./BarChart.jsx";
import ParticipationRanking from "./ParticipationRanking.jsx";
import LineChart from "./LineChart.jsx";

function Reports() {
  const [range, setRange] = useState("6months");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/analytics/stats").then((d) => setStats(d.data));
  }, []);

  return (
    <div>
      <div className={styles.pageHeader}>
        <p className={styles.pageEyebrow}>Reports</p>
        <h1 className={styles.pageTitle}>Analytics</h1>
        <p className={styles.pageSubtitle}>Platform-wide data insights and SDG progress metrics</p>
      </div>

      <StatsGrid stats={stats} />

      <RangeToolbar range={range} onChange={setRange} />

      <div className={styles.chartsGrid}>
        <div className={styles.fullWidth}>
          <BarChart range={range} />
        </div>
        <ParticipationRanking range={range} />
        <LineChart range={range} />
      </div>
    </div>
  );
}

export default Reports;