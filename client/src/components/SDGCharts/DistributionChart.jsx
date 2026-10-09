import { useEffect, useRef, useState } from "react";
import { fetchDistribution } from "../../services/analyticsService";
import useChart from "./useChart";
import styles from "./SDGCharts.module.css";

function DistributionChart({ range }) {
  const canvasRef = useRef(null);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchDistribution({ range })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [range]);

  const config =
    data.length > 0
      ? {
          type: "bar",

          data: {
            labels: data.map((d) => d.tag),

            datasets: [
              {
                label: "Projects",

                data: data.map((d) => d.count),

                backgroundColor: data.map((d) => d.color),

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

                bodyColor: "rgba(255,255,255,0.7)",

                padding: 10,

                cornerRadius: 8,

                callbacks: {
                  title: (items) => {
                    const index = items[0]?.dataIndex;

                    return data[index]?.label || "";
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
                  color: "#bbb",

                  font: {
                    size: isMobile ? 9 : 10,
                  },

                  maxRotation: 0,

                  minRotation: 0,

                  autoSkip: true,

                  maxTicksLimit: isMobile ? 6 : 17,

                  callback: function (value, index) {
                    if (isMobile) {
                      const number = index + 1;

                      // Only show every few SDGs on mobile
                      if (
                        number === 1 ||
                        number === 4 ||
                        number === 7 ||
                        number === 10 ||
                        number === 13 ||
                        number === 16
                      ) {
                        return `SDG ${number}`;
                      }

                      return "";
                    }

                    return data[index]?.tag || "";
                  },
                },
              },

              y: {
                beginAtZero: true,

                grid: {
                  color: "rgba(0,0,0,0.04)",
                },

                ticks: {
                  color: "#bbb",

                  font: {
                    size: 11,
                  },

                  precision: 0,
                },

                border: {
                  display: false,
                },
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
      <p className={styles.chartCardTitle}>
        SDG project distribution
      </p>

      {loading && (
        <p className={styles.chartStatus}>
          Loading…
        </p>
      )}

      {error && (
        <p className={styles.chartStatusError}>
          {error}
        </p>
      )}

      {!loading &&
        !error &&
        data.length === 0 && (
          <p className={styles.chartStatus}>
            No data available yet.
          </p>
        )}

      {!loading && !error && data.length > 0 && (
        <>
          <div className={styles.chartCanvasWrapper}>
            <canvas ref={canvasRef} />
          </div>

          <div className={styles.chartLegend}>
            {data.map((d) => (
              <span
                key={d.tag}
                className={styles.legendItem}
              >
                <span
                  className={styles.legendDot}
                  style={{
                    background: d.color,
                  }}
                />

                {d.label}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default DistributionChart;