import { useEffect, useRef, useState } from "react";
import { fetchTrend } from "../../services/analyticsService";
import useChart from "./useChart";
import styles from "./SDGCharts.module.css";

const TREND_METRICS = [
  { label: "Projects", value: "projects" },
  { label: "Users", value: "users" },
  { label: "Events", value: "events" },
];

function TrendChart({ range, barangay = "" }) {
  const canvasRef = useRef(null);
  const [metric, setMetric] = useState("projects");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const result = await fetchTrend({
          metric,
          range,
          barangay,
        });

        if (!cancelled) {
          setData(Array.isArray(result) ? result : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load SDG trends.");
          setData([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [metric, range, barangay]);

  const selectedMetric =
    TREND_METRICS.find((item) => item.value === metric)?.label || metric;

  const config = data.length
    ? {
        type: "line",
        data: {
          labels: data.map((item) => item.label),
          datasets: [
            {
              label: selectedMetric,
              data: data.map((item) => Number(item.total || 0)),
              borderColor: "#0a4a38",
              backgroundColor: "rgba(10, 74, 56, 0.06)",
              fill: true,
              tension: 0.4,
              pointRadius: 4,
              pointBackgroundColor: "#0a4a38",
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
              ticks: {
                font: { size: 11 },
                color: "#bbb",
                maxRotation: 0,
              },
            },
            y: {
              beginAtZero: true,
              grid: { color: "rgba(0,0,0,0.04)" },
              ticks: {
                font: { size: 11 },
                color: "#bbb",
                precision: 0,
              },
              border: { display: false },
            },
          },
        },
      }
    : null;

  useChart(canvasRef, config);

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartCardHeader}>
        <p className={styles.chartCardTitle}>
          SDG Trend Over Time
        </p>

        <div className={styles.metricToggle}>
          {TREND_METRICS.map((item) => (
            <button
              type="button"
              key={item.value}
              className={`${styles.metricBtn} ${
                metric === item.value ? styles.active : ""
              }`}
              onClick={() => setMetric(item.value)}
              aria-pressed={metric === item.value}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <p className={styles.chartStatus}>Loading...</p>
      )}

      {error && (
        <p className={styles.chartStatusError} role="alert">
          {error}
        </p>
      )}

      {!loading && !error && data.length === 0 && (
        <p className={styles.chartStatus}>
          No data available yet.
        </p>
      )}

      {!loading && !error && data.length > 0 && (
        <div className={styles.trendCanvasWrapper}>
          <canvas ref={canvasRef} />
        </div>
      )}
    </div>
  );
}

export default TrendChart;