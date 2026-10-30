
import { useState, useEffect, useRef } from "react";
import styles from "./DoughnutChart.module.css";
import { api } from "../../services/api";
import { useChart } from "./useChart.js";

const sliceLabels = {
  id: "sliceLabels",

  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const dataset = chart.data.datasets[0];
    const meta = chart.getDatasetMeta(0);

    if (!dataset || !meta) return;

    const total = dataset.data.reduce(
      (sum, value) => sum + Number(value || 0),
      0
    );

    meta.data.forEach((arc, index) => {
      const count = Number(dataset.data[index] || 0);

      if (!count || !total) return;

      const percentage = ((count / total) * 100).toFixed(1);
      const center = arc.getCenterPoint();

      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
      ctx.shadowBlur = 3;

      ctx.font = "bold 13px Arial";
      ctx.fillText(String(count), center.x, center.y - 7);

      ctx.font = "bold 10px Arial";
      ctx.fillText(`${percentage}%`, center.x, center.y + 8);

      ctx.restore();
    });
  },
};

function DoughnutChart({ range }) {
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
        `/analytics/participation?range=${encodeURIComponent(
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

        const topTen = [...items]
          .map((item) => ({
            ...item,
            count: Number(item.count || 0),
          }))
          .filter((item) => item.count > 0)
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setData(topTen);
      })
      .catch((err) => {
        if (!active) return;

        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load SDG participation."
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

  const total = data.reduce(
    (sum, item) => sum + item.count,
    0
  );

  const config =
    data.length > 0 && total > 0
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
                borderColor: "#FFFFFF",
                hoverOffset: 8,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
              padding: 8,
            },
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                backgroundColor: "#0F172A",
                padding: 12,
                titleFont: {
                  size: 13,
                  weight: "bold",
                },
                bodyFont: {
                  size: 12,
                },
                callbacks: {
                  title: (items) => {
                    const item = data[items[0].dataIndex];

                    return `${item.tag || ""} ${
                      item.label || ""
                    }`.trim();
                  },
                  label: (context) => {
                    const count = Number(context.raw || 0);
                    const percentage = (
                      (count / total) *
                      100
                    ).toFixed(1);

                    return ` ${count} projects (${percentage}%)`;
                  },
                },
              },
            },
          },
          plugins: [sliceLabels],
        }
      : null;

  useChart(canvasRef, config);

  const isEmpty = !loading && !error && data.length === 0;
  const metricCards = data.slice(0, 5);

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHead}>
        <p className={styles.chartEyebrow}>Participation</p>
        <p className={styles.chartTitle}>
          Top 10 SDG Participation
        </p>
      </div>

      {loading && (
        <p className={styles.chartEmpty}>Loading…</p>
      )}

      {error && (
        <div className={styles.chartEmpty}>
          <p>Unable to load SDG participation.</p>
          <p className={styles.chartEmptySub}>{error}</p>
        </div>
      )}

      {isEmpty && (
        <div className={styles.chartEmpty}>
          <p>No data yet.</p>
          <p className={styles.chartEmptySub}>
            The top SDGs by project count will appear here.
          </p>
        </div>
      )}

      {!loading && !error && !isEmpty && (
        <div className={styles.participationLayout}>
          <div className={styles.pieChartContainer}>
            <canvas ref={canvasRef} />
          </div>

          <div className={styles.metricCards}>
            <div className={styles.metricCardsHeader}>
              <span>SDG Breakdown</span>
              <span>{data.length} SDGs</span>
            </div>

            {metricCards.map((item, index) => (
              <div
                key={item.tag || item.label || index}
                className={styles.metricCard}
              >
                <div
                  className={styles.metricCardColor}
                  style={{
                    backgroundColor: item.color || "#64748b",
                  }}
                >
                  {String(item.tag || "").replace("SDG ", "")}
                </div>

                <div className={styles.metricCardInfo}>
                  <span className={styles.metricCardName}>
                    {item.label || item.tag}
                  </span>
                  <span className={styles.metricCardLabel}>
                    Projects
                  </span>
                </div>

                <span className={styles.metricCardCount}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DoughnutChart;
