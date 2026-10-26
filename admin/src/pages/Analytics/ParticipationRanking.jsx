
import { useState, useEffect, useRef } from "react";
import styles from "./ParticipationRanking.module.css";
import { api } from "../../services/api";
import { useChart } from "./useChart.js";

function ParticipationRanking({ range }) {
  const canvasRef = useRef(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    api
      .get(`/analytics/participation?range=${range}`)
      .then((response) => {
        if (active) {
          setData(Array.isArray(response.data) ? response.data : []);
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err.message || "Failed to load SDG participation."
          );
          setData([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [range]);

  const topTen = [...data]
    .sort((a, b) => Number(b.count || 0) - Number(a.count || 0))
    .slice(0, 10);

  const total = topTen.reduce(
    (sum, item) => sum + Number(item.count || 0),
    0
  );

  const config =
    topTen.length > 0 && total > 0
      ? {
          type: "pie",
          data: {
            labels: topTen.map((item) => item.label || item.tag),
            datasets: [
              {
                data: topTen.map((item) => Number(item.count || 0)),
                backgroundColor: topTen.map(
                  (item) => item.color || "#64748b"
                ),
                borderColor: "#ffffff",
                borderWidth: 2,
                hoverOffset: 6,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: "right",
                labels: {
                  color: "#64748b",
                  boxWidth: 10,
                  boxHeight: 10,
                  padding: 10,
                  font: { size: 11 },
                },
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

  const isEmpty =
    !loading &&
    !error &&
    (topTen.length === 0 || total === 0);

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHead}>
        <p className={styles.chartEyebrow}>Participation</p>
        <p className={styles.chartTitle}>Top 10 SDG Distribution</p>
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
            SDG distribution will appear when projects have been counted.
          </p>
        </div>
      )}

      {!loading && !error && !isEmpty && (
        <div style={{ height: 250, position: "relative" }}>
          <canvas ref={canvasRef} />
        </div>
      )}
    </div>
  );
}

export default ParticipationRanking;
