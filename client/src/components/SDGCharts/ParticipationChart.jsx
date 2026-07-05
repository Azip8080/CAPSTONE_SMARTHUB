import { useEffect, useRef, useState } from "react";
import { fetchParticipation } from "../../services/analyticsService";
import useChart from "./useChart";
import styles from "./SDGCharts.module.css";

function ParticipationChart({ range }) {
  const canvasRef = useRef(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchParticipation({ range })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [range]);

  const total = data.reduce((sum, d) => sum + d.count, 0);

  const config =
    data.length > 0
      ? {
          type: "doughnut",
          data: {
            labels: data.map((d) => d.label),
            datasets: [
              {
                data: data.map((d) => d.count),
                backgroundColor: data.map((d) => d.color),
                borderWidth: 3,
                borderColor: "#fff",
                hoverOffset: 6,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "68%",
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                backgroundColor: "#111",
                titleColor: "#fff",
                bodyColor: "rgba(255,255,255,0.7)",
                padding: 10,
                cornerRadius: 8,
                callbacks: {
                  label: (item) =>
                    ` ${item.raw} projects (${Math.round(
                      (item.raw / total) * 100
                    )}%)`,
                },
              },
            },
          },
        }
      : null;

  useChart(canvasRef, config);

  return (
    <div className={styles.chartCard}>
      <p className={styles.chartCardTitle}>
        Top 3 SDG Participation
      </p>

      {loading && (
        <p className={styles.chartStatus}>Loading...</p>
      )}

      {error && (
        <p className={`${styles.chartStatus} ${styles.error}`}>
          {error}
        </p>
      )}

      {!loading && !error && data.length === 0 && (
        <p className={styles.chartStatus}>
          No data available yet.
        </p>
      )}

      <div
        className={styles.chartCanvasWrapper}
        style={{ height: "200px" }}
      >
        <canvas ref={canvasRef}></canvas>
      </div>

      <div className={styles.chartLegend}>
        {data.map((d) => (
          <span key={d.tag} className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ background: d.color }}
            />
            {d.label} —{" "}
            {total > 0
              ? `${Math.round((d.count / total) * 100)}%`
              : "—"}
          </span>
        ))}
      </div>
    </div>
  );
}

export default ParticipationChart;