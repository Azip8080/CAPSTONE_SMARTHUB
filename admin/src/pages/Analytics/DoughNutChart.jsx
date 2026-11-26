
import { useMemo, useRef } from "react";
import styles from "./DoughnutChart.module.css";
import { useChart } from "./useChart.js";

const SDG_COLORS = [
  "#E5243B",
  "#DDA63A",
  "#4C9F38",
  "#C5192D",
  "#FF3A21",
  "#26BDE2",
  "#FCC30B",
  "#A21942",
  "#FD6925",
  "#DD1367",
  "#FD9D24",
  "#BF8B2E",
  "#3F7E44",
  "#0A97D9",
  "#56C02B",
  "#00689D",
  "#19486A",
];

const SDG_NAMES = [
  "No Poverty",
  "Zero Hunger",
  "Good Health and Well-being",
  "Quality Education",
  "Gender Equality",
  "Clean Water and Sanitation",
  "Affordable and Clean Energy",
  "Decent Work and Economic Growth",
  "Industry, Innovation and Infrastructure",
  "Reduced Inequalities",
  "Sustainable Cities and Communities",
  "Responsible Consumption and Production",
  "Climate Action",
  "Life Below Water",
  "Life on Land",
  "Peace, Justice and Strong Institutions",
  "Partnerships for the Goals",
];

const SDG_LIST = SDG_NAMES.map((label, index) => ({
  tag: `SDG ${index + 1}`,
  label,
  color: SDG_COLORS[index],
}));

function normalizeSdgTag(value) {
  if (value === null || value === undefined) return [];

  const values = Array.isArray(value) ? value : [value];

  return values.flatMap((item) => {
    if (typeof item === "number") {
      return item >= 1 && item <= 17
        ? [`SDG ${item}`]
        : [];
    }

    if (typeof item === "object" && item !== null) {
      return normalizeSdgTag(
        item.sdgTag ?? item.tag ?? item.name ?? item.number
      );
    }

    const text = String(item).trim();

    if (!text) return [];

    const match = text.match(/(?:SDG\s*)?(\d{1,2})/i);

    if (match && Number(match[1]) >= 1 && Number(match[1]) <= 17) {
      return [`SDG ${Number(match[1])}`];
    }

    return [text];
  });
}

function getProjectSdgs(project) {
  return [
    ...new Set([
      ...normalizeSdgTag(project?.sdgTag),
      ...normalizeSdgTag(project?.sdgTags),
      ...normalizeSdgTag(project?.tags),
    ]),
  ];
}

function getEventSdgs(event) {
  return [
    ...new Set([
      ...normalizeSdgTag(event?.sdgTag),
      ...normalizeSdgTag(event?.sdgTags),
      ...normalizeSdgTag(event?.sdg),
      ...normalizeSdgTag(event?.sdgNumber),
      ...normalizeSdgTag(event?.sdgGoal),
      ...normalizeSdgTag(event?.tags),
    ]),
  ];
}

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

function DoughnutChart({ projects = [], events = [] }) {
  const canvasRef = useRef(null);

  const data = useMemo(() => {
    return SDG_LIST.map((sdg) => {
      const projectCount = projects.filter((project) =>
        getProjectSdgs(project).includes(sdg.tag)
      ).length;

      const eventCount = events.filter((event) =>
        getEventSdgs(event).includes(sdg.tag)
      ).length;

      return {
        ...sdg,
        projectCount,
        eventCount,
        count: projectCount + eventCount,
      };
    })
      .filter((item) => item.count > 0)
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count;
        }

        return (
          Number(a.tag.replace("SDG ", "")) -
          Number(b.tag.replace("SDG ", ""))
        );
      })
      .slice(0, 10);
  }, [projects, events]);

  const total = data.reduce(
    (sum, item) => sum + item.count,
    0
  );

  const totalProjects = data.reduce(
    (sum, item) => sum + item.projectCount,
    0
  );

  const totalEvents = data.reduce(
    (sum, item) => sum + item.eventCount,
    0
  );

  const config =
    data.length > 0 && total > 0
      ? {
          type: "pie",
          data: {
            labels: data.map((item) => item.label),
            datasets: [
              {
                data: data.map((item) => item.count),
                backgroundColor: data.map((item) => item.color),
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
                callbacks: {
                  title: (items) => {
                    const item = data[items[0].dataIndex];
                    return `${item.tag}: ${item.label}`;
                  },
                  label: (context) => {
                    const item = data[context.dataIndex];
                    const percentage = (
                      (item.count / total) *
                      100
                    ).toFixed(1);

                    return [
                      ` Total: ${item.count} (${percentage}%)`,
                      ` Projects: ${item.projectCount}`,
                      ` Events: ${item.eventCount}`,
                    ];
                  },
                },
              },
            },
          },
          plugins: [sliceLabels],
        }
      : null;

  useChart(canvasRef, config);

  const isEmpty = data.length === 0;

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHead}>
        <p className={styles.chartEyebrow}>Participation</p>
        <p className={styles.chartTitle}>
          Top 10 SDG Participation
        </p>
      </div>

      {isEmpty ? (
        <div className={styles.chartEmpty}>
          <p>No SDG participation data yet.</p>
          <p className={styles.chartEmptySub}>
            SDG participation will appear when projects or events have valid SDG tags.
          </p>
        </div>
      ) : (
        <>
          <div className={styles.participationLayout}>
            <div className={styles.pieChartContainer}>
              <canvas ref={canvasRef} />
            </div>

            <div className={styles.metricCards}>
              <div className={styles.metricCardsHeader}>
                <span>SDG Breakdown</span>
                <span>{data.length} SDGs</span>
              </div>

              {data.map((item) => (
                <div
                  key={item.tag}
                  className={styles.metricCard}
                >
                  <div
                    className={styles.metricCardColor}
                    style={{
                      backgroundColor: item.color,
                    }}
                  >
                    {item.tag.replace("SDG ", "")}
                  </div>

                  <div className={styles.metricCardInfo}>
                    <span className={styles.metricCardName}>
                      {item.label}
                    </span>
                    <span className={styles.metricCardLabel}>
                      {item.projectCount} Projects · {item.eventCount} Events
                    </span>
                  </div>

                  <span className={styles.metricCardCount}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.participationSummary}>
            <span>{totalProjects} Project participations</span>
            <span>{totalEvents} Event participations</span>
            <strong>{total} Total participations</strong>
          </div>
        </>
      )}
    </div>
  );
}

export default DoughnutChart;
