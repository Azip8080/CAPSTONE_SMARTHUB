import { useMemo, useState } from "react";
import styles from "./SDGOverview.module.css";

import sdg1 from "../../../assets/1.jpg";
import sdg2 from "../../../assets/2.jpg";
import sdg3 from "../../../assets/3.jpg";
import sdg4 from "../../../assets/4.jpg";
import sdg5 from "../../../assets/5.jpg";
import sdg6 from "../../../assets/6.jpg";
import sdg7 from "../../../assets/7.jpg";
import sdg8 from "../../../assets/8.jpg";
import sdg9 from "../../../assets/9.jpg";
import sdg10 from "../../../assets/10.jpg";
import sdg11 from "../../../assets/11.jpg";
import sdg12 from "../../../assets/12.jpg";
import sdg13 from "../../../assets/13.jpg";
import sdg14 from "../../../assets/14.jpg";
import sdg15 from "../../../assets/15.jpg";
import sdg16 from "../../../assets/16.jpg";
import sdg17 from "../../../assets/17.jpg";

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

const SDG_IMAGES = [
  sdg1,
  sdg2,
  sdg3,
  sdg4,
  sdg5,
  sdg6,
  sdg7,
  sdg8,
  sdg9,
  sdg10,
  sdg11,
  sdg12,
  sdg13,
  sdg14,
  sdg15,
  sdg16,
  sdg17,
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
          image: SDG_IMAGES[index],
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
            <img
              src={sdg.image}
              alt={sdg.tag}
              className={styles.sdgImage}
            />

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
            <img
              src={selected.image}
              alt={selected.tag}
              className={styles.detailsImage}
            />

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