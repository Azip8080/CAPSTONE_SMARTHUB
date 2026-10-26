
import { useEffect, useRef, useState } from "react";
import { fetchDistribution } from "../../api/analyticsAPI";
import useChart from "./useChart";
import styles from "./SDGCharts.module.css";

function DistributionChart({ range }) {
  const canvasRef = useRef(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 600);

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const result = await fetchDistribution({ range });

        if (!cancelled) {
          setData(Array.isArray(result) ? result : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load SDG distribution.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [range]);

  const config = data.length
    ? {
        type: "bar",
        data: {
          labels: data.map((item) => item.tag),
          datasets: [
            {
              label: "Projects",
              data: data.map((item) => item.count),
              backgroundColor: data.map((item) => item.color),
              borderRadius: 5,
              borderSkipped: false,
              categoryPercentage: 0.7,
              barPercentage: 0.8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 400 },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: (items) =>
                  data[items[0]?.dataIndex]?.label || "",
                label: (item) => ` ${item.raw} projects`,
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                color: "#bbb",
                font: { size: isMobile ? 9 : 10 },
                maxRotation: 0,
                minRotation: 0,
                autoSkip: false,
                callback: function (_, index) {
                  if (isMobile) {
                    const number = index + 1;
                    return [1, 4, 7, 10, 13, 16].includes(number)
                      ? `SDG ${number}`
                      : "";
                  }

                  return data[index]?.tag || "";
                },
              },
            },
            y: {
              beginAtZero: true,
              grid: { color: "rgba(0,0,0,0.04)" },
              ticks: {
                color: "#bbb",
                precision: 0,
              },
              border: { display: false },
            },
          },
          layout: {
            padding: {
              left: isMobile ? 5 : 0,
              right: isMobile ? 5 : 0,
            },
          },
        },
      }
    : null;

  useChart(canvasRef, config);

  return (
    <div className={styles.chartCard}>
      <p className={styles.chartCardTitle}>SDG Project Distribution</p>

      {loading && <p className={styles.chartStatus}>Loading...</p>}

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
        <>
          <div className={styles.chartCanvasWrapper}>
            <canvas ref={canvasRef} />
          </div>

          <div className={styles.chartLegend}>
            {data.map((item) => (
              <span key={item.tag} className={styles.legendItem}>
                <span
                  className={styles.legendDot}
                  style={{ background: item.color }}
                />
                {item.label}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default DistributionChart;
