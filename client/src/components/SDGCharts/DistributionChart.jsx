
import { useEffect, useRef, useState } from "react";
import { fetchDistribution } from "../../services/analyticsService";
import useChart from "./useChart";
import styles from "./SDGCharts.module.css";

function DistributionChart({ range, barangay = "" }) {
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
        const result = await fetchDistribution({
          range,
          barangay,
        });

        if (!cancelled) {
          setData(Array.isArray(result) ? result : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Unable to load SDG distribution."
          );
          setData([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [range, barangay]);

  const barLabelsPlugin = {
    id: "sdgBarLabels",

    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      const dataset = chart.data.datasets[0];

      if (!dataset) return;

      const meta = chart.getDatasetMeta(0);

      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 12px Arial";
      ctx.fillStyle = "#ffffff";

      meta.data.forEach((bar, index) => {
        const value = Number(dataset.data[index] || 0);

        if (value <= 0) return;

        const position = bar.getCenterPoint();
        const label = data[index]?.tag || `SDG ${index + 1}`;

        ctx.fillText(
          label,
          position.x,
          position.y
        );
      });

      ctx.restore();
    },
  };

  const config = data.length
    ? {
        type: "bar",

        data: {
          labels: data.map((item) => item.tag),

          datasets: [
            {
              label: "Projects",
              data: data.map((item) => Number(item.count || 0)),

              backgroundColor: data.map(
                (item) => item.color || "#315d91"
              ),

              borderRadius: 5,
              borderSkipped: false,
              categoryPercentage: 0.7,
              barPercentage: 0.8,
            },
          ],
        },

        plugins: [barLabelsPlugin],

        options: {
          responsive: true,
          maintainAspectRatio: false,

          animation: {
            duration: 400,
          },

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
                  return data[index]?.label || data[index]?.tag || "";
                },

                label: (item) => {
                  return ` ${item.raw} projects`;
                },
              },
            },
          },

          scales: {
            x: {
              grid: {
                display: false,
              },

              ticks: {
                color: "#647c98",
                font: {
                  size: 11,
                },
                maxRotation: 0,
                minRotation: 0,
              },
            },

            y: {
              beginAtZero: true,

              ticks: {
                color: "#94a3b8",
                precision: 0,
              },

              grid: {
                color: "rgba(30,64,100,0.06)",
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

  return (
    <div className={styles.chartCard}>
      <div className={styles.distributionHeader}>
        <p className={styles.chartCardTitle}>
          DISTRIBUTION
        </p>

        <h3>Project Distribution by SDG</h3>
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
        <div className={styles.chartCanvasWrapper}>
          <canvas ref={canvasRef} />
        </div>
      )}
    </div>
  );
}

export default DistributionChart;