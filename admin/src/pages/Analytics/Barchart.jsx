import { useState, useEffect, useRef } from "react";
import styles from "./BarChart.module.css";
import { api } from "../../services/api";
import { useChart } from "./useChart.js";

function BarChart({ range }) {
  const canvasRef = useRef(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/analytics/distribution?range=${range}`)
      .then((d) => setData(d.data ?? []))
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
                data: data.map((d) => d.count),
                backgroundColor: data.map((d) => d.color),
                borderRadius: 5,
                borderSkipped: false,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: "#0f172a",
                callbacks: {
                  title: (items) => data[items[0].dataIndex]?.label,
                  label: (item) => ` ${item.raw} projects`,
                },
              },
            },
            scales: {
              x: { grid: { display: false }, ticks: { font: { size: 10 }, color: "#94a3b8" } },
              y: {
                grid: { color: "rgba(0,0,0,0.04)" },
                ticks: { font: { size: 11 }, color: "#94a3b8" },
                border: { display: false },
              },
            },
          },
        }
      : null;

  useChart(canvasRef, config);

  const isEmpty = !loading && data.every((d) => d.count === 0);

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHead}>
        <p className={styles.chartEyebrow}>Distribution</p>
        <p className={styles.chartTitle}>Project Distribution by SDG</p>
      </div>
      {loading && <p className={styles.chartEmpty}>Loading…</p>}
      {isEmpty && (
        <div className={styles.chartEmpty}>
          <p>No data yet.</p>
          <p className={styles.chartEmptySub}>Projects will appear here once they're tagged with an SDG.</p>
        </div>
      )}
      {!loading && !isEmpty && (
        <div style={{ height: 260 }}>
          <canvas ref={canvasRef} />
        </div>
      )}
    </div>
  );
}

export default BarChart;