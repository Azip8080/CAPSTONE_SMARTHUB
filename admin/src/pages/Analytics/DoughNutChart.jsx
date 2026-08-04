import { useState, useEffect, useRef } from "react";
import styles from "./DoughnutChart.module.css";
import { api } from "../../services/api";
import { useChart } from "./useChart.js";

function DoughnutChart({ range }) {
  const canvasRef = useRef(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/analytics/participation?range=${range}`)
      .then((d) => setData(d.data ?? []))
      .finally(() => setLoading(false));
  }, [range]);

  const total = data.reduce((s, d) => s + d.count, 0);

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
              legend: { display: false },
              tooltip: {
                backgroundColor: "#0f172a",
                callbacks: {
                  label: (item) =>
                    ` ${item.raw} projects (${Math.round((item.raw / total) * 100)}%)`,
                },
              },
            },
          },
        }
      : null;

  useChart(canvasRef, config);

  const isEmpty = !loading && data.length === 0;

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHead}>
        <p className={styles.chartEyebrow}>Participation</p>
        <p className={styles.chartTitle}>Top 3 SDG Participation</p>
      </div>
      {loading && <p className={styles.chartEmpty}>Loading…</p>}
      {isEmpty && (
        <div className={styles.chartEmpty}>
          <p>No data yet.</p>
          <p className={styles.chartEmptySub}>The top SDGs by project count will show up here.</p>
        </div>
      )}
      {!loading && !isEmpty && (
        <>
          <div style={{ height: 220 }}>
            <canvas ref={canvasRef} />
          </div>
          <div className={styles.legend}>
            {data.map((d) => (
              <span key={d.tag} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: d.color }} />
                {d.label} — {total > 0 ? `${Math.round((d.count / total) * 100)}%` : "—"}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default DoughnutChart;