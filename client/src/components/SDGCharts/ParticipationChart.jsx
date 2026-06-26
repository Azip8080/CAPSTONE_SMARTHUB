import { useEffect, useRef, useState } from "react";
import { fetchParticipation } from "../../services/analyticsService";
import useChart from "./useChart";
import styles from "./SDGCharts.module.css";

function ParticipationChart({ range }) {
  const canvasRef = useRef(null);
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchParticipation({ range })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [range]);

  const total = data.reduce((s, d) => s + d.count, 0);

  const config = data.length > 0 ? {
    type: "doughnut",
    data: {
      labels: data.map((d) => d.label),
      datasets: [{
        data: data.map((d) => d.count),
        backgroundColor: data.map((d) => d.color),
        borderWidth: 3,
        borderColor: "#fff",
        hoverOffset: 6,
      }],
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
            label: (item) =>
              ` ${item.raw} projects (${Math.round((item.raw / total) * 100)}%)`,
          },
        },
      },
    },
  } : null;

  useChart(canvasRef, config);

  return (
    <div className="chart-card">
      <p className="chart-card-title">Top 3 SDG participation</p>
      {loading && <p className="chart-status">Loading…</p>}
      {error   && <p className="chart-status error">{error}</p>}
      {!loading && !error && data.length === 0 && (
        <p className="chart-status">No data available yet.</p>
      )}
      <div className="chart-canvas-wrapper" style={{ height: 200 }}>
        <canvas ref={canvasRef} />
      </div>
      <div className="chart-legend">
        {data.map((d) => (
          <span key={d.tag} className="legend-item">
            <span className="legend-dot" style={{ background: d.color }} />
            {d.label} — {total > 0 ? `${Math.round((d.count / total) * 100)}%` : "—"}
          </span>
        ))}
      </div>
    </div>
  );
}
export default ParticipationChart;