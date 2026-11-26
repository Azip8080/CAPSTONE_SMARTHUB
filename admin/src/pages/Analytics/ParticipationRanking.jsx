
import { useState, useEffect, useRef } from "react";
import styles from "./ParticipationRanking.module.css";
import { api } from "../../services/api";
import { useChart } from "./useChart.js";

function ParticipationRanking({ range }) {
  const canvasRef = useRef(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    api
      .get(`/analytics/participation?range=${range}&limit=17`)
      .then((response) => {
        if (active) {
          setData(
  Array.isArray(response.data?.data) ? response.data.data : []
);
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err.message || "Failed to load SDG participation."
          );
          setData([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [range]);

  const topTen = [...data]
    .sort(
      (a, b) =>
        Number(b.totalParticipation ?? b.count ?? 0) -
        Number(a.totalParticipation ?? a.count ?? 0)
    )
    .slice(0, 10);

  const total = topTen.reduce(
    (sum, item) =>
      sum + Number(item.totalParticipation ?? item.count ?? 0),
    0
  );

  const totalProjects = topTen.reduce(
    (sum, item) => sum + Number(item.projectCount || 0),
    0
  );

  const totalEvents = topTen.reduce(
    (sum, item) => sum + Number(item.eventCount || 0),
    0
  );

  const config =
    topTen.length > 0 && total > 0
      ? {
          type: "doughnut",
          data: {
            labels: topTen.map((item) => item.label || item.tag),
            datasets: [
              {
                data: topTen.map((item) =>
                  Number(item.totalParticipation ?? item.count ?? 0)
                ),
                backgroundColor: topTen.map(
                  (item) => item.color || "#64748b"
                ),
                borderColor: "#ffffff",
                borderWidth: 2,
                hoverOffset: 7,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "62%",
            plugins: {
              legend: {
                display: true,
                position: "right",
                labels: {
                  color: "#64748b",
                  boxWidth: 10,
                  boxHeight: 10,
                  padding: 9,
                  font: { size: 10 },
                  generateLabels: (chart) => {
                    const dataset = chart.data.datasets[0];

                    return chart.data.labels.map((label, index) => ({
                      text: `${label} (${dataset.data[index]})`,
                      fillStyle: dataset.backgroundColor[index],
                      strokeStyle: dataset.backgroundColor[index],
                      lineWidth: 0,
                      hidden: false,
                      index,
                    }));
                  },
                },
              },
              tooltip: {
                backgroundColor: "#0f172a",
                padding: 12,
                callbacks: {
                  label: (context) => {
                    const item = topTen[context.dataIndex];
                    const count = Number(
                      item.totalParticipation ?? item.count ?? 0
                    );
                    const projects = Number(item.projectCount || 0);
                    const events = Number(item.eventCount || 0);
                    const percentage = total
                      ? ((count / total) * 100).toFixed(1)
                      : "0.0";

                    return [
                      ` Total participation: ${count} (${percentage}%)`,
                      ` Projects: ${projects}`,
                      ` Events: ${events}`,
                    ];
                  },
                },
              },
            },
          },
        }
      : null;

  useChart(canvasRef, config);

  const isEmpty =
    !loading &&
    !error &&
    (topTen.length === 0 || total === 0);

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHead}>
        <p className={styles.chartEyebrow}>Participation</p>
        <p className={styles.chartTitle}>Top 10 SDG Distribution</p>
        <p className={styles.chartEmptySub}>
          Combined published projects and events by SDG
        </p>
      </div>

      {loading && (
        <p className={styles.chartEmpty}>Loading...</p>
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
            SDG participation will appear when published projects and events have been counted.
          </p>
        </div>
      )}

      {!loading && !error && !isEmpty && (
        <>
          <div style={{ height: 280, position: "relative" }}>
            <canvas ref={canvasRef} />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "10px",
              marginTop: "18px",
              paddingTop: "16px",
              borderTop: "1px solid #e2e8f0",
            }}
          >
            <div>
              <p style={{ margin: 0, color: "#64748b", fontSize: "11px" }}>
                Total Participation
              </p>
              <strong style={{ display: "block", marginTop: "5px", color: "#142b4a", fontSize: "21px" }}>
                {total}
              </strong>
            </div>

            <div>
              <p style={{ margin: 0, color: "#64748b", fontSize: "11px" }}>
                Projects
              </p>
              <strong style={{ display: "block", marginTop: "5px", color: "#2563eb", fontSize: "21px" }}>
                {totalProjects}
              </strong>
            </div>

            <div>
              <p style={{ margin: 0, color: "#64748b", fontSize: "11px" }}>
                Events
              </p>
              <strong style={{ display: "block", marginTop: "5px", color: "#0d9488", fontSize: "21px" }}>
                {totalEvents}
              </strong>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ParticipationRanking;
