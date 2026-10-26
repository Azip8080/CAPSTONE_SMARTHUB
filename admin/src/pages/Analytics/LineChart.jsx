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
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    api
      .get(`/analytics/trend?metric=${metric}&range=${range}`)
      .then((response) => {
        if (active) {
          setData(Array.isArray(response.data) ? response.data : []);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || "Failed to load trend data.");
          setData([]);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [metric, range]);

  const config =
    data.length > 0
      ? {
          type: "line",
          data: {
            labels: data.map((item) => item.label),
            datasets: [
              {
                label:
                  TREND_METRICS.find((item) => item.value === metric)?.label ||
                  "Activity",
                data: data.map((item) => Number(item.total) || 0),
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59, 130, 246, 0.08)",
                fill: true,
                tension: 0.3,
                pointRadius: 3,
                pointHoverRadius: 5,
                pointBackgroundColor: "#3b82f6",
                pointBorderColor: "#ffffff",
                pointBorderWidth: 2,
                borderWidth: 2,
                spanGaps: false,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              intersect: false,
              mode: "index",
            },
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                backgroundColor: "#0f172a",
                callbacks: {
                  label: (context) =>
                    ` ${context.dataset.label}: ${Math.round(
                      Number(context.raw) || 0
                    )}`,
                },
              },
            },
            scales: {
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  autoSkip: true,
                  maxRotation: 0,
                  font: {
                    size: 11,
                  },
                  color: "#94a3b8",
                },
              },
              y: {
                beginAtZero: true,
                grid: {
                  color: "rgba(0, 0, 0, 0.04)",
                },
                ticks: {
                  stepSize: 1,
                  precision: 0,
                  font: {
                    size: 11,
                  },
                  color: "#94a3b8",
                  callback: (value) =>
                    Number.isInteger(Number(value)) ? value : "",
                },
                border: {
                  display: false,
                },
              },
            },
          },
        }
      : null;

  useChart(canvasRef, config);

  const isEmpty = !loading && !error && data.length === 0;

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHead}>
        <div>
          <p className={styles.chartEyebrow}>Trend</p>
          <p className={styles.chartTitle}>Daily Trend Over Time</p>
        </div>

        <div className={styles.metricToggle}>
          {TREND_METRICS.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`${styles.metricBtn} ${
                metric === item.value ? styles.activeMetric : ""
              }`}
              onClick={() => setMetric(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <p className={styles.chartEmpty}>Loading...</p>
      )}

      {error && (
        <div className={styles.chartEmpty}>
          <p>Unable to load trend data.</p>
          <p className={styles.chartEmptySub}>{error}</p>
        </div>
      )}

      {isEmpty && (
        <div className={styles.chartEmpty}>
          <p>No data yet.</p>
          <p className={styles.chartEmptySub}>
            Daily activity will appear here when project and participation
            data are available.
          </p>
        </div>
      )}

      {!loading && !error && !isEmpty && (
        <div className={styles.chartCanvas}>
          <canvas ref={canvasRef} />
        </div>
      )}
    </div>
  );
}

export default LineChart;