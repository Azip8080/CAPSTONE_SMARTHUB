import { useState, useEffect, useRef } from "react";
import styles from "./BarChart.module.css";
import { api } from "../../services/api";
import { useChart } from "./useChart.js";

const sdgLabels = {
  id: "sdgLabels",

  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const dataset = chart.data.datasets[0];
    const meta = chart.getDatasetMeta(0);

    if (!dataset || !meta) return;

    meta.data.forEach((bar, index) => {
      const value = Number(dataset.data[index] || 0);

      if (value <= 0) return;

      const center = bar.getCenterPoint();
      const barHeight = Math.abs(bar.base - bar.y);

      if (barHeight < 22) return;

      const tag = chart.data.labels[index];

      const sdgNumber = String(tag || "").match(/\d+/)?.[0] || tag;

      ctx.save();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`SDG ${sdgNumber}`, center.x, center.y);
      ctx.restore();
    });
  },
};

function BarChart({ range }) {
  const canvasRef = useRef(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    api
      .get(
        `/analytics/distribution?range=${encodeURIComponent(
          range ?? "all"
        )}`
      )
      .then((response) => {
        if (!active) return;

        const items = Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data)
            ? response.data
            : [];

        setData(
          items
            .map((item) => ({
              ...item,
              count: Number(item.count || 0),
            }))
            .filter((item) => item.count > 0)
        );
      })
      .catch((err) => {
        if (!active) return;

        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load project distribution."
        );

        setData([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [range]);

  const config =
    data.length > 0
      ? {
          type: "bar",
          data: {
            labels: data.map((item) => item.tag),
            datasets: [
              {
                data: data.map((item) => item.count),
                backgroundColor: data.map(
                  (item) => item.color || "#4470AD"
                ),
                borderRadius: 5,
                borderSkipped: false,
                barPercentage: 0.75,
                categoryPercentage: 0.8,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                backgroundColor: "#0F172A",
                padding: 12,
                callbacks: {
                  title: (items) => {
                    const item = data[items[0].dataIndex];

                    return `${item.tag || ""} ${
                      item.label || ""
                    }`.trim();
                  },
                  label: (item) => ` ${item.raw} projects`,
                },
              },
            },
            scales: {
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  font: {
                    size: 10,
                  },
                  color: "#94A3B8",
                },
              },
              y: {
                beginAtZero: true,
                grid: {
                  color: "rgba(0, 0, 0, 0.04)",
                },
                ticks: {
                  stepSize: 1,
                  precision: 0,
                  font: {
                    size: 11,
                  },
                  color: "#94A3B8",
                  callback: (value) =>
                    Number.isInteger(Number(value)) ? value : "",
                },
                border: {
                  display: false,
                },
              },
            },
          },
          plugins: [sdgLabels],
        }
      : null;

  useChart(canvasRef, config);

  const isEmpty =
    !loading &&
    !error &&
    (data.length === 0 ||
      data.every((item) => Number(item.count) === 0));

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHead}>
        <p className={styles.chartEyebrow}>Distribution</p>
        <p className={styles.chartTitle}>
          Project Distribution by SDG
        </p>
      </div>

      {loading && (
        <p className={styles.chartEmpty}>Loading…</p>
      )}

      {error && (
        <div className={styles.chartEmpty}>
          <p>Unable to load project distribution.</p>
          <p className={styles.chartEmptySub}>{error}</p>
        </div>
      )}

      {isEmpty && (
        <div className={styles.chartEmpty}>
          <p>No data yet.</p>
          <p className={styles.chartEmptySub}>
            Projects will appear here once they're tagged with an SDG.
          </p>
        </div>
      )}

      {!loading && !error && !isEmpty && (
        <div style={{ height: 280, position: "relative" }}>
          <canvas ref={canvasRef} />
        </div>
      )}
    </div>
  );
}

export default BarChart;