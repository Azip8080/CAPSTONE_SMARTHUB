import { useState, useEffect, useRef } from "react";
import styles from "./LineChart.module.css";
import { api } from "../../services/api";
import { useChart } from "./useChart.js";
import { TREND_METRICS } from "./constants.js";

function LineChart({ range }) {
  const canvasRef = useRef(null);
  const [metric, setMetric] = useState("projects");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/analytics/trend?metric=${metric}&range=${range}`)
      .then((d) => setData(d.data ?? []))
      .finally(() => setLoading(false));
  }, [metric, range]);

  const config =
    data.length > 0
      ? {
          type: "line",
          data: {
            labels: data.map((d) => d.label),
            datasets: [
              {
                label: TREND_METRICS.find((m) => m.value === metric)?.label,
                data: data.map((d) => d.total),
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59,130,246,0.06)",
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: "#3b82f6",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { backgroundColor: "#0f172a" },
            },
            scales: {
              x: { grid: { display: false }, ticks: { font: { size: 11 }, color: "#94a3b8" } },
              y: {
                grid: { color: "rgba(0,0,0,0.04)" },
                ticks: { font: { size: 11 }, color: "#94a3b8" },
                border: { display: false },
              },
            },
          },
        }
      : null;

  useChart(canvasRef, config);

  const isEmpty = !loading && data.length === 0;

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHead}>
        <div>
          <p className={styles.chartEyebrow}>Trend</p>
          <p className={styles.chartTitle}>Trend Over Time</p>
        </div>
        <div className={styles.metricToggle}>
          {TREND_METRICS.map((m) => (
            <button
              key={m.value}
              className={`${styles.metricBtn} ${metric === m.value ? styles.activeMetric : ""}`}
              onClick={() => setMetric(m.value)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      {loading && <p className={styles.chartEmpty}>Loading…</p>}
      {isEmpty && (
        <div className={styles.chartEmpty}>
          <p>No data yet.</p>
          <p className={styles.chartEmptySub}>Activity over time will show up here as it happens.</p>
        </div>
      )}
      {!loading && !isEmpty && (
        <div style={{ height: 220 }}>
          <canvas ref={canvasRef} />
        </div>
      )}
    </div>
  );
}

export default LineChart;