import { useState } from "react";
import styles from "./FeaturedProject.module.css";
import ProjectModal from "./ProjectModal";

const SDG_COLORS = {
  "SDG 1": "#E5243B",
  "SDG 2": "#DDA63A",
  "SDG 3": "#4C9F38",
  "SDG 4": "#C5192D",
  "SDG 5": "#FF3A21",
  "SDG 6": "#26BDE2",
  "SDG 7": "#FCC30B",
  "SDG 8": "#A21942",
  "SDG 9": "#FD6925",
  "SDG 10": "#DD1367",
  "SDG 11": "#FD9D24",
  "SDG 12": "#BF8B2E",
  "SDG 13": "#3F7E44",
  "SDG 14": "#0A97D9",
  "SDG 15": "#56C02B",
  "SDG 16": "#00689D",
  "SDG 17": "#19486A",
};

const STATUS_STYLES = {
  Planned: {
    bg: "#f1f5f9",
    color: "#475569",
  },
  Ongoing: {
    bg: "#dcfce7",
    color: "#166534",
  },
  Completed: {
    bg: "#dbeafe",
    color: "#1d4ed8",
  },
};

function FeaturedProject({ project }) {
  const [open, setOpen] =
    useState(false);

  const sdgs =
    Array.isArray(project.sdgTags) &&
    project.sdgTags.length > 0
      ? project.sdgTags
      : [project.sdgTag];

  const tags =
    Array.isArray(project.tags)
      ? project.tags
      : [];

  const primaryColor =
    SDG_COLORS[project.sdgTag] ||
    "#0f172a";

  const status =
    STATUS_STYLES[project.status] ||
    STATUS_STYLES.Planned;

  return (
    <>
      <div
        className={styles.card}
        style={{
          borderTop:
            `4px solid ${primaryColor}`,
        }}
      >
        <div className={styles.left}>
          <div className={styles.badges}>
            <span
              className={
                styles.featuredBadge
              }
            >
              ⭐ Featured Project
            </span>

            {sdgs.map((sdg) => (
              <span
                key={sdg}
                className={
                  styles.sdgBadge
                }
                style={{
                  background:
                    SDG_COLORS[sdg] ||
                    "#0f172a",
                }}
              >
                {sdg}
              </span>
            ))}

            <span
              className={
                styles.statusBadge
              }
              style={{
                background:
                  status.bg,
                color:
                  status.color,
              }}
            >
              {project.status}
            </span>
          </div>

          <h2
            className={styles.title}
          >
            {project.title}
          </h2>

          <p
            className={
              styles.barangay
            }
          >
            📍 {project.barangay}
          </p>

          <p
            className={
              styles.description
            }
          >
            {project.description}
          </p>

          {tags.length > 0 && (
            <div
              className={
                styles.tags
              }
            >
              {tags.map((tag) => (
                <span
                  key={tag}
                  className={
                    styles.tag
                  }
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <button
            className={
              styles.viewBtn
            }
            onClick={() =>
              setOpen(true)
            }
          >
            View full project →
          </button>
        </div>

        <div
          className={styles.right}
        >
          {project.photos?.length >
          0 ? (
            <img
              className={
                styles.projectImage
              }
              src={`http://localhost:5000${project.photos[0]}`}
              alt={project.title}
            />
          ) : (
            <div
              className={
                styles.imagePlaceholder
              }
              style={{
                borderColor:
                  primaryColor,
              }}
            >
              <span
                className={
                  styles.imagePlaceholderText
                }
              >
                Project Photo
              </span>
            </div>
          )}
        </div>
      </div>

      <ProjectModal
        project={project}
        open={open}
        onClose={() =>
          setOpen(false)
        }
      />
    </>
  );
}

export default FeaturedProject;