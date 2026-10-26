
import { useState, useEffect, useRef } from "react";
import styles from "./DoughnutChart.module.css";
import { api } from "../../services/api";
import { useChart } from "./useChart.js";

function DoughnutChart({ range }) {
  const canvasRef = useRef(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    api
      .get(`/analytics/participation?range=${encodeURIComponent(range ?? "all")}`)
      .then((response) => {
        if (!active) return;

        const items = Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data)
            ? response.data
            : [];

        const topTen = [...items]
          .map((item) => ({
            ...item,
            count: Number(item.count || 0),
          }))
          .filter((item) => item.count > 0)
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setData(topTen);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "Failed to load SDG participation.");
        setData([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [range]);

  const total = data.reduce((sum, item) => sum + item.count, 0);

  const config =
    data.length > 0 && total > 0
      ? {
          type: "pie",
          data: {
            labels: data.map((item) => item.label || item.tag),
            datasets: [
              {
                data: data.map((item) => item.count),
                backgroundColor: data.map(
                  (item) => item.color || "#64748b"
                ),
                borderWidth: 2,
                borderColor: "#ffffff",
                hoverOffset: 6,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                backgroundColor: "#0f172a",
                callbacks: {
                  label: (context) => {
                    const count = Number(context.raw || 0);
                    const percentage = total
                      ? ((count / total) * 100).toFixed(1)
                      : "0.0";

                    return ` ${count} projects (${percentage}%)`;
                  },
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
        <p className={styles.chartEyebrow}>Participation</p>
        <p className={styles.chartTitle}>Top 10 SDG Participation</p>
      </div>

      {loading && (
        <p className={styles.chartEmpty}>Loading…</p>
      )}

      {error && (
        <div className={styles.chartEmpty}>
          <p>Unable to load SDG participation.</p>
          <p className={styles.chartEmptySub}>{error}</p>
        </div>
      )}

      {isEmpty && (
        <div className={styles.chartEmpty}>
          <p>No data yet.</p>
          <p className={styles.chartEmptySub}>
            The top SDGs by project count will appear here.
          </p>
        </div>
      )}

      {!loading && !error && !isEmpty && (
        <>
          <div style={{ height: 250, position: "relative" }}>
            <canvas ref={canvasRef} />
          </div>

          <div className={styles.legend}>
            {data.map((item) => (
              <span
                key={item.tag || item.label}
                className={styles.legendItem}
              >
                <span
                  className={styles.legendDot}
                  style={{
                    background: item.color || "#64748b",
                  }}
                />
                {item.label || item.tag} —{" "}
                {total > 0
                  ? `${((item.count / total) * 100).toFixed(1)}%`
                  : "—"}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default DoughnutChart;
