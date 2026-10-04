import { useMemo, useState } from "react";
import styles from "./ProjectStatus.module.css";

const STATUS_DATA = [
  {
    key: "Planned",
    label: "Planned",
    color: "#64748b",
  },
  {
    key: "Ongoing",
    label: "Ongoing",
    color: "#10b981",
  },
  {
    key: "Completed",
    label: "Completed",
    color: "#3b82f6",
  },
];

function ProjectStatus({ projects }) {
  const [selectedStatus, setSelectedStatus] =
    useState(null);

  const statusData = useMemo(() => {
    return STATUS_DATA.map((status) => ({
      ...status,
      projects: projects.filter(
        (project) =>
          project.status === status.key
      ),
    }));
  }, [projects]);

  const totalProjects = projects.length;

  const selected = statusData.find(
    (status) =>
      status.key === selectedStatus
  );

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <p className={styles.title}>
            Project Status
          </p>

          <p className={styles.subtitle}>
            Current status of community projects
          </p>
        </div>

        <div className={styles.total}>
          <strong>{totalProjects}</strong>
          <span>Total</span>
        </div>
      </div>

      <div className={styles.statusGrid}>
        {statusData.map((status) => {
          const percentage =
            totalProjects > 0
              ? Math.round(
                  (status.projects.length /
                    totalProjects) *
                    100
                )
              : 0;

          return (
            <button
              key={status.key}
              type="button"
              className={`${styles.statusCard} ${
                selectedStatus === status.key
                  ? styles.selected
                  : ""
              }`}
              onClick={() =>
                setSelectedStatus(
                  selectedStatus ===
                    status.key
                    ? null
                    : status.key
                )
              }
            >
              <div
                className={styles.statusIcon}
                style={{
                  background:
                    status.color,
                }}
              />

              <div
                className={styles.statusInfo}
              >
                <span
                  className={
                    styles.statusLabel
                  }
                >
                  {status.label}
                </span>

                <strong
                  className={
                    styles.statusCount
                  }
                >
                  {status.projects.length}
                </strong>

                <span
                  className={
                    styles.statusPercentage
                  }
                >
                  {percentage}% of projects
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className={styles.details}>
          <div className={styles.detailsHeader}>
            <div>
              <p
                className={
                  styles.detailsTitle
                }
              >
                {selected.label} Projects
              </p>

              <p
                className={
                  styles.detailsSubtitle
                }
              >
                {selected.projects.length}{" "}
                {selected.projects.length === 1
                  ? "project"
                  : "projects"}
              </p>
            </div>

            <button
              type="button"
              className={styles.clearButton}
              onClick={() =>
                setSelectedStatus(null)
              }
            >
              Clear
            </button>
          </div>

          {selected.projects.length === 0 ? (
            <p className={styles.empty}>
              No projects have this status.
            </p>
          ) : (
            <div className={styles.projectList}>
              {selected.projects.map(
                (project) => (
                  <div
                    key={project._id}
                    className={styles.project}
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
                        {project.barangay} ·{" "}
                        {project.sdgTag}
                      </p>
                    </div>

                    <span
                      className={
                        styles.projectStatus
                      }
                      style={{
                        color: selected.color,
                      }}
                    >
                      {selected.label}
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

export default ProjectStatus;