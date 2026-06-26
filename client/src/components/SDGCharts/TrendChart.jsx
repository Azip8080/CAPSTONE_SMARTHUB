import { useEffect, useRef, useState } from "react";
import { fetchTrend } from "../../services/analyticsService";
import useChart from "./useChart";
import styles from "./SDGCharts.module.css";

const TREND_METRICS = [
  { label: "Projects", value: "projects" },
  { label: "Users", value: "users" },
  { label: "Events", value: "events" },
];

function TrendChart({ range }) {
  const canvasRef = useRef(null);
  const [metric, setMetric]   = useState("projects");
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchTrend({ metric, range })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [metric, range]);

  const config = data.length > 0 ? {
    type: "line",
    data: {
      labels: data.map((d) => d.label),
      datasets: [{
        label: TREND_METRICS.find((m) => m.value === metric)?.label || metric,
        data: data.map((d) => d.total),
        borderColor: "#0a4a38",
        backgroundColor: "rgba(10, 74, 56, 0.06)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#0a4a38",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#111",
          titleColor: "#fff",
          bodyColor: "rgba(255,255,255,0.7)",
          padding: 10,
          cornerRadius: 8,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 }, color: "#bbb" },
        },
        y: {
          grid: { color: "rgba(0,0,0,0.04)" },
          ticks: { font: { size: 11 }, color: "#bbb" },
          border: { display: false },
        },
      },
    },
  } : null;

  useChart(canvasRef, config);

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartCardHeader}>
        <p className={styles.chartCardTitle}>SDG trend over time</p>
        <div className={styles.metricToggle}>
          {TREND_METRICS.map((m) => (
            <button
  key={m.value}
  className={`${styles.metricBtn} ${
    metric === m.value ? styles.active : ""
  }`}
  onClick={() => setMetric(m.value)}
>
  {m.label}
</button>
          ))}
        </div>
      </div>
      {loading && <p className={styles.chartStatus}>Loading…</p>}
      {error   && <p className={`${styles.chartStatus} ${styles.error}`}>{error}</p>}
      {!loading && !error && data.length === 0 && (
        <p className={styles.chartStatus}>No data available yet.</p>
      )}
      <div className={styles.chartCanvasWrapper} style={{ height: 240 }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
export default TrendChart;