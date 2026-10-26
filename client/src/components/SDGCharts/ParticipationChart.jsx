
import { useEffect, useRef, useState } from "react";
import { fetchParticipation } from "../../services/analyticsService";
import useChart from "./useChart";
import styles from "./SDGCharts.module.css";

function ParticipationChart({ range, barangay = "" }) {
  const canvasRef = useRef(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetchParticipation({ range, barangay })
      .then((result) => {
        if (cancelled) return;

        const topTen = (Array.isArray(result) ? result : [])
          .map((item) => ({
            ...item,
            count: Number(item.count || 0),
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setData(topTen);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e.message || "Failed to load SDG participation.");
          setData([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [range, barangay]);

  const total = data.reduce((sum, item) => sum + item.count, 0);

  const config =
    data.length > 0
      ? {
          type: "doughnut",
          data: {
            labels: data.map((item) => item.label || item.tag),
            datasets: [
              {
                data: data.map((item) => item.count),
                backgroundColor: data.map(
                  (item) => item.color || "#64748b"
                ),
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
              legend: { display: false },
              tooltip: {
                backgroundColor: "#111",
                titleColor: "#fff",
                bodyColor: "rgba(255,255,255,0.7)",
                padding: 10,
                cornerRadius: 8,
                callbacks: {
                  label: (item) => {
                    const percentage =
                      total > 0
                        ? ((Number(item.raw) / total) * 100).toFixed(1)
                        : "0.0";

                    return ` ${item.raw} projects (${percentage}%)`;
                  },
                },
              },
            },
          },
        }
      : null;

  useChart(canvasRef, config);

  return (
    <div className={styles.chartCard}>
      <p className={styles.chartCardTitle}>Top 10 SDG Participation</p>

      {loading && <p className={styles.chartStatus}>Loading...</p>}

      {error && (
        <p className={styles.chartStatusError}>{error}</p>
      )}

      {!loading && !error && data.length === 0 && (
        <p className={styles.chartStatus}>
          No data available for this period.
        </p>
      )}

      {!loading && !error && data.length > 0 && (
        <>
          <div className={styles.participationCanvasWrapper}>
            <canvas ref={canvasRef} />
          </div>

          <div className={styles.chartLegend}>
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

export default ParticipationChart;
