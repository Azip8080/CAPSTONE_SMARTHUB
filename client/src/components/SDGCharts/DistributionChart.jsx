import { useEffect, useRef, useState } from "react";
import { fetchDistribution } from "../../services/analyticsService";
import useChart from "./useChart";
import styles from "./SDGCharts.module.css";

function DistributionChart({ range }) {
  const canvasRef = useRef(null);
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchDistribution({ range })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [range]);

  const config = data.length > 0 ? {
    type: "bar",
    data: {
      labels: data.map((d) => d.tag),  
      datasets: [{
        label: "Projects",
        data: data.map((d) => d.count),
        backgroundColor: data.map((d) => d.color),
        borderRadius: 5,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#111",
          titleColor: "#fff",
          bodyColor: "rgba(255,255,255,0.7)",
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            title: (items) => data[items[0].dataIndex]?.label,
            label: (item)  => ` ${item.raw} projects`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 10 }, color: "#bbb", maxRotation: 0 },
        },
        y: {
          grid: { color: "rgba(0,0,0,0.04)" },
          ticks: { font: { size: 11 }, color: "#bbb" },
          border: { display: false },
        },
      },
    },
  } : null;

  useChart(canvasRef, config);

  return (
    <div className={styles.chartCard}>
      <p className={styles.chartCardTitle}>SDG project distribution</p>
      {loading && <p className="chart-status">Loading…</p>}
      {error   && <p className="chart-status error">{error}</p>}
      {!loading && !error && data.length === 0 && (
        <p className={styles.chartStatus}>No data available yet.</p>
      )}
      <div className={styles.chartCanvasWrapper} style={{ height: 240 }}>
        <canvas ref={canvasRef} />
      </div>
      <div className={styles.chartLegend}>
        {data.map((d) => (
          <span key={d.tag} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: d.color }} />
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
export default DistributionChart;