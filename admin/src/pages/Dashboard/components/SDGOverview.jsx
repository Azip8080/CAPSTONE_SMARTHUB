import { useMemo, useState } from "react";
import styles from "./SDGOverview.module.css";

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
  "Good Health and Well-Being",
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

function SDGOverview({ projects }) {
  const [selectedSDG, setSelectedSDG] =
    useState(null);

  const sdgData = useMemo(() => {
    return Array.from(
      { length: 17 },
      (_, index) => {
        const tag = `SDG ${index + 1}`;

        const relatedProjects =
          projects.filter((project) => {
            const tags = Array.isArray(
              project.sdgTags
            )
              ? project.sdgTags
              : [];

            return (
              project.sdgTag === tag ||
              tags.includes(tag)
            );
          });

        return {
          number: index + 1,
          tag,
          name: SDG_NAMES[index],
          color: SDG_COLORS[index],
          projects: relatedProjects,
        };
      }
    );
  }, [projects]);

  const selected = sdgData.find(
    (sdg) =>
      sdg.number === selectedSDG
  );

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <p className={styles.title}>
            SDG Overview
          </p>

          <p className={styles.subtitle}>
            Projects connected to each
            Sustainable Development Goal
          </p>
        </div>

        {selected && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={() =>
              setSelectedSDG(null)
            }
          >
            Clear
          </button>
        )}
      </div>

      <div className={styles.sdgGrid}>
        {sdgData.map((sdg) => (
          <button
            key={sdg.number}
            type="button"
            className={`${styles.sdgItem} ${
              selectedSDG === sdg.number
                ? styles.selected
                : ""
            }`}
            style={{
              "--sdg-color": sdg.color,
            }}
            onClick={() =>
              setSelectedSDG(sdg.number)
            }
          >
            <span className={styles.number}>
              {sdg.number}
            </span>

            <span className={styles.count}>
              {sdg.projects.length}
            </span>
          </button>
        ))}
      </div>

      {selected && (
        <div
          className={styles.details}
          style={{
            borderTopColor:
              selected.color,
          }}
        >
          <div className={styles.detailsHeader}>
            <div
              className={styles.detailsNumber}
              style={{
                background:
                  selected.color,
              }}
            >
              {selected.number}
            </div>

            <div>
              <p className={styles.detailsTitle}>
                {selected.tag}
              </p>

              <p className={styles.detailsName}>
                {selected.name}
              </p>
            </div>

            <div className={styles.projectCount}>
              <strong>
                {selected.projects.length}
              </strong>

              <span>
                {selected.projects.length === 1
                  ? "Project"
                  : "Projects"}
              </span>
            </div>
          </div>

          {selected.projects.length === 0 ? (
            <p className={styles.empty}>
              No projects are currently
              associated with this SDG.
            </p>
          ) : (
            <div className={styles.projectList}>
              {selected.projects.map(
                (project) => (
                  <div
                    key={project._id}
                    className={
                      styles.project
                    }
                  >
                    <div
                      className={
                        styles.projectInfo
                      }
                    >
                      <p
                        className={
                          styles.projectTitle
                        }
                      >
                        {project.title}
                      </p>

                      <p
                        className={
                          styles.projectSub
                        }
                      >
                        {project.barangay}
                      </p>
                    </div>

                    <span
                      className={`${styles.status} ${
                        styles[
                          project.status?.toLowerCase()
                        ]
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SDGOverview;