
import { useEffect, useRef, useState } from "react";
import { fetchParticipation } from "../../services/analyticsService";
import useChart from "./useChart";
import styles from "./SDGCharts.module.css";

function ParticipationChart({ range, barangay = "" }) {
  const canvasRef = useRef(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const result = await fetchParticipation({
          range,
          barangay,
        });

        const topTen = (Array.isArray(result) ? result : [])
          .map((item) => ({
            ...item,
            count: Number(item.count || 0),
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        if (!cancelled) {
          setData(topTen);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Failed to load SDG participation."
          );
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
  }, [range, barangay]);

  const total = data.reduce(
    (sum, item) => sum + item.count,
    0
  );

  const pieLabelsPlugin = {
    id: "pieLabels",

    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);

      if (!meta || !meta.data.length) return;

      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";

      meta.data.forEach((arc, index) => {
        const { x, y, startAngle, endAngle, outerRadius } =
          arc.getProps(
            ["x", "y", "startAngle", "endAngle", "outerRadius"],
            true
          );

        const angle = (startAngle + endAngle) / 2;
        const radius = outerRadius * 0.62;

        const labelX = x + Math.cos(angle) * radius;
        const labelY = y + Math.sin(angle) * radius;

        const count = data[index]?.count ?? 0;

        const percentage =
          total > 0
            ? ((count / total) * 100).toFixed(1)
            : "0.0";

        const sliceSize = Math.abs(endAngle - startAngle);

        if (sliceSize < 0.12) return;

        const fontSize = Math.max(
          10,
          Math.min(14, outerRadius * 0.11)
        );

        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillText(
          count.toLocaleString(),
          labelX,
          labelY - fontSize * 0.45
        );

        ctx.font = `bold ${Math.max(9, fontSize * 0.75)}px Arial`;
        ctx.fillText(
          `${percentage}%`,
          labelX,
          labelY + fontSize * 0.8
        );
      });

      ctx.restore();
    },
  };

  const config = data.length
    ? {
        type: "pie",

        data: {
          labels: data.map(
            (item) => item.label || item.tag
          ),

          datasets: [
            {
              data: data.map((item) => item.count),

              backgroundColor: data.map(
                (item) => item.color || "#64748b"
              ),

              borderWidth: 2,
              borderColor: "#ffffff",
              hoverOffset: 8,
            },
          ],
        },

        plugins: [pieLabelsPlugin],

        options: {
          responsive: true,
          maintainAspectRatio: false,

          plugins: {
            legend: {
              display: false,
            },

            tooltip: {
              backgroundColor: "#111",
              titleColor: "#fff",
              bodyColor: "rgba(255,255,255,0.8)",
              padding: 12,
              cornerRadius: 8,

              callbacks: {
                title: (items) => {
                  const index = items[0]?.dataIndex;

                  return (
                    data[index]?.label ||
                    data[index]?.tag ||
                    ""
                  );
                },

                label: (item) => {
                  const percentage =
                    total > 0
                      ? (
                          (Number(item.raw) / total) *
                          100
                        ).toFixed(1)
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
      <div className={styles.chartCardHeader}>
        <div>
          <p className={styles.chartCardTitle}>
            PARTICIPATION
          </p>

          <h3 className={styles.chartSubtitle}>
            Top 10 SDG Participation
          </h3>
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
          No data available for this period.
        </p>
      )}

      {!loading && !error && data.length > 0 && (
        <div className={styles.participationContent}>
          <div className={styles.participationCanvasWrapper}>
            <canvas ref={canvasRef} />
          </div>

          <div className={styles.participationBreakdown}>
            <div className={styles.breakdownHeader}>
              <span>SDG BREAKDOWN</span>
              <span>{data.length} SDGs</span>
            </div>

            {data.map((item) => (
              <div
                key={item.tag || item.label}
                className={styles.breakdownItem}
              >
                <span
                  className={styles.breakdownColor}
                  style={{
                    background: item.color || "#64748b",
                  }}
                >
                  {item.tag?.replace("SDG ", "") || ""}
                </span>

                <div className={styles.breakdownInfo}>
                  <span className={styles.breakdownName}>
                    {item.label || item.tag}
                  </span>

                  <span className={styles.breakdownCaption}>
                    Projects
                  </span>
                </div>

                <strong className={styles.breakdownCount}>
                  {item.count}
                </strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ParticipationChart;