import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import {
  fetchDistribution,
  fetchParticipation,
  fetchTrend,
} from "../services/analyticsService";
import "./SDGCharts.css";

Chart.register(...registerables);


const RANGE_OPTIONS = [
  { label: "1 month", value: "1month" },
  { label: "3 months", value: "3months" },
  { label: "6 months", value: "6months" },
  { label: "1 year", value: "1year" },
  { label: "All time", value: "all" },
];

const TREND_METRICS = [
  { label: "Projects", value: "projects" },
  { label: "Users", value: "users" },
  { label: "Events", value: "events" },
];



function useChart(canvasRef, config) {
  const chartRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current || !config) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(canvasRef.current, config);
    return () => chartRef.current?.destroy();
  }, [config]);
}



function DistributionChart({ range }) {
  const canvasRef = useRef(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
            labels: data.map((d) => `SDG ${d.sdg}`),
            datasets: [
              {
                label: "Projects",
                data: data.map((d) => d.count),
                backgroundColor: data.map((d) => d.color),
                borderRadius: 4,
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
                callbacks: {
                  title: (items) => data[items[0].dataIndex]?.label,
                  label: (item) => ` ${item.raw} projects`,
                },
              },
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: {
                  font: { size: 11 },
                  color: "#888",
                  autoSkip: false,
                  maxRotation: 0,
                },
              },
              y: {
                grid: { color: "rgba(128,128,128,0.1)" },
                ticks: { font: { size: 11 }, color: "#888" },
                border: { display: false },
              },
            },
          },
        }
      : null;

  useChart(canvasRef, config);

  return (
    <div className="chart-card">
      <p className="chart-card-title">SDG project distribution</p>
      {loading && <p className="chart-status">Loading…</p>}
      {error && <p className="chart-status error">{error}</p>}
      {!loading && !error && data.length === 0 && (
        <p className="chart-status">No data available.</p>
      )}
      <div className="chart-canvas-wrapper" style={{ height: 220 }}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Bar chart showing total projects per SDG"
        />
      </div>
      {/* Legend */}
      <div className="chart-legend">
        {data.map((d) => (
          <span key={d.sdg} className="legend-item">
            <span
              className="legend-dot"
              style={{ background: d.color }}
            />
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}



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

  const total = data.reduce((s, d) => s + d.participants, 0);

  const config =
    data.length > 0
      ? {
          type: "doughnut",
          data: {
            labels: data.map((d) => d.label),
            datasets: [
              {
                data: data.map((d) => d.participants),
                backgroundColor: data.map((d) => d.color),
                borderWidth: 2,
                borderColor: "#fff",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "65%",
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (item) =>
                    ` ${item.raw} participants (${Math.round(
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
    <div className="chart-card">
      <p className="chart-card-title">Top 3 SDG participation</p>
      {loading && <p className="chart-status">Loading…</p>}
      {error && <p className="chart-status error">{error}</p>}
      {!loading && !error && data.length === 0 && (
        <p className="chart-status">No data available.</p>
      )}
      <div className="chart-canvas-wrapper" style={{ height: 200 }}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Doughnut chart showing top 3 SDGs by participation"
        />
      </div>
      <div className="chart-legend">
        {data.map((d) => (
          <span key={d.sdg} className="legend-item">
            <span
              className="legend-dot"
              style={{ background: d.color }}
            />
            {d.label} —{" "}
            {total > 0
              ? `${Math.round((d.participants / total) * 100)}%`
              : "—"}
          </span>
        ))}
      </div>
    </div>
  );
}



function TrendChart({ range }) {
  const canvasRef = useRef(null);
  const [metric, setMetric] = useState("projects");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchTrend({ metric, range })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [metric, range]);

  const config =
    data.length > 0
      ? {
          type: "line",
          data: {
            labels: data.map((d) => d.label),
            datasets: [
              {
                label:
                  TREND_METRICS.find((m) => m.value === metric)?.label ||
                  metric,
                data: data.map((d) => d.total),
                borderColor: "#0a6e5c",
                backgroundColor: "rgba(10, 110, 92, 0.08)",
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: "#0a6e5c",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (item) => ` ${item.raw}`,
                },
              },
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { font: { size: 11 }, color: "#888" },
              },
              y: {
                grid: { color: "rgba(128,128,128,0.1)" },
                ticks: { font: { size: 11 }, color: "#888" },
                border: { display: false },
              },
            },
          },
        }
      : null;

  useChart(canvasRef, config);

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <p className="chart-card-title">SDG trend over time</p>
        <div className="metric-toggle">
          {TREND_METRICS.map((m) => (
            <button
              key={m.value}
              className={`metric-btn ${metric === m.value ? "active" : ""}`}
              onClick={() => setMetric(m.value)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      {loading && <p className="chart-status">Loading…</p>}
      {error && <p className="chart-status error">{error}</p>}
      {!loading && !error && data.length === 0 && (
        <p className="chart-status">No data available.</p>
      )}
      <div className="chart-canvas-wrapper" style={{ height: 220 }}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Line chart showing ${metric} over time`}
        />
      </div>
    </div>
  );
}



export default function SDGCharts() {
  const [range, setRange] = useState("6months");

  return (
    <section className="sdg-charts">
      {/* Shared time filter */}
      <div className="charts-toolbar">
        <p className="charts-toolbar-label">Time filter</p>
        <div className="range-pills">
          {RANGE_OPTIONS.map((r) => (
            <button
              key={r.value}
              className={`range-pill ${range === r.value ? "active" : ""}`}
              onClick={() => setRange(r.value)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Charts */}
      <DistributionChart range={range} />

      <div className="charts-row">
        <ParticipationChart range={range} />
        <TrendChart range={range} />
      </div>
    </section>
  );
}