
import { useState, useEffect, useRef } from "react";
import styles from "./LineChart.module.css";
import { api } from "../../services/api";
import { useChart } from "./useChart.js";
import { TREND_METRICS } from "./constants.js";

function LineChart({ range = "30d" }) {
  const canvasRef = useRef(null);
  const [metric, setMetric] = useState("projects");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTrend() {
      setLoading(true);
      setError("");

      try {
        const query = new URLSearchParams({
          metric,
          range: String(range ?? "30d"),
        });

        const response = await api.get(
          `/analytics/trend?${query.toString()}`
        );

        if (!active) return;

        // Supports both { data: [...] } and direct array responses.
        const payload = response.data;
        const rows = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.results)
              ? payload.results
              : null;

        if (!rows) {
          throw new Error(
            payload?.message ||
              "The analytics API did not return a list of trend records."
          );
        }

        setData(
          rows.map((item) => ({
            ...item,
            label: item.label ?? item.date ?? "",
            total: Number(item.total ?? item.count ?? 0),
          }))
        );
      } catch (err) {
        if (!active) return;

        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load daily trend data."
        );
        setData([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTrend();

    return () => {
      active = false;
    };
  }, [metric, range]);

  const metricLabel =
    TREND_METRICS.find((item) => item.value === metric)?.label ||
    "Activity";

  const config =
    data.length > 0
      ? {
          type: "line",
          data: {
            labels: data.map((item) => item.label),
            datasets: [
              {
                label: metricLabel,
                data: data.map((item) => item.total),
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
                    ` ${context.dataset.label}: ${context.raw}`,
                },
              },
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: {
                  autoSkip: true,
                  maxRotation: 0,
                  font: { size: 11 },
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
                  font: { size: 11 },
                  color: "#94a3b8",
                },
                border: { display: false },
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
          <p className={styles.chartEyebrow}>Admin Analytics</p>
          <p className={styles.chartTitle}>Daily SDG Activity Trend</p>
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
              disabled={loading}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <p className={styles.chartEmpty}>Loading daily trend data...</p>
      )}

      {error && (
        <div className={styles.chartEmpty}>
          <p>Unable to load trend data.</p>
          <p className={styles.chartEmptySub}>{error}</p>
        </div>
      )}

      {isEmpty && (
        <div className={styles.chartEmpty}>
          <p>No daily trend data yet.</p>
          <p className={styles.chartEmptySub}>
            Data will appear when the backend returns activity for this period.
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
