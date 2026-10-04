import { useState } from "react";
import styles from "./ProjectDetailModal.module.css";
import {
  SDG_COLORS,
  STATUS_STYLES,
} from "./constants.js";
import ProjectFormModal from "../DataManagement/ProjectFormModal.jsx";

function ProjectDetailModal({
  project,
  onClose,
  onFeatureToggle,
  onUpdate,
}) {
  const [editing, setEditing] =
    useState(false);

  if (!project) {
    return null;
  }

  const color =
    SDG_COLORS[project.sdgTag] ||
    "#0f172a";

  const status =
    STATUS_STYLES[project.status] ||
    STATUS_STYLES.Planned;

  const handleSubmit = async (form) => {
    await onUpdate(
      project._id,
      form
    );

    setEditing(false);
  };

  if (editing) {
    return (
      <ProjectFormModal
        isEdit
        initialData={{
          title:
            project.title || "",
          description:
            project.description || "",
          sdgTag:
            project.sdgTag || "SDG 1",
          sdgTags:
            project.sdgTags || [],
          tags:
            project.tags || [],
          barangay:
            project.barangay || "",
          status:
            project.status || "Planned",
          photos:
            project.photos || [],
        }}
        onClose={() =>
          setEditing(false)
        }
        onSubmit={handleSubmit}
      />
    );
  }

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
    >
      <div
        className={styles.modal}
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div
          className={styles.modalHeader}
          style={{
            borderTop:
              `4px solid ${color}`,
          }}
        >
          <div
            className={
              styles.modalHeaderTop
            }
          >
            <div
              className={
                styles.modalBadges
              }
            >
              <span
                className={
                  styles.sdgBadge
                }
                style={{
                  background: color,
                }}
              >
                {project.sdgTag}
              </span>

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

              {project.featured && (
                <span
                  className={
                    styles.featuredBadge
                  }
                >
                  Featured
                </span>
              )}
            </div>

            <button
              className={
                styles.closeBtn
              }
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          <h2
            className={
              styles.modalTitle
            }
          >
            {project.title}
          </h2>

          <p
            className={
              styles.modalBarangay
            }
          >
            {project.barangay}
          </p>
        </div>

        <div
          className={
            styles.modalBody
          }
        >
          {project.photos?.length >
          0 && (
            <div
              className={
                styles.photoGrid
              }
            >
              {project.photos.map(
                (photo, index) => (
                  <img
                    key={`${photo}-${index}`}
                    src={`http://localhost:5000${photo}`}
                    alt={`${project.title} ${
                      index + 1
                    }`}
                    className={
                      styles.projectPhoto
                    }
                  />
                )
              )}
            </div>
          )}

          <p
            className={
              styles.modalDesc
            }
          >
            {project.description}
          </p>

          <div
            className={
              styles.modalActions
            }
          >
            <button
              className={
                styles.editBtn
              }
              onClick={() =>
                setEditing(true)
              }
            >
              Edit Project
            </button>

            <button
              className={
                project.featured
                  ? styles.unfeatureBtn
                  : styles.featureBtn
              }
              onClick={() =>
                onFeatureToggle(
                  project
                )
              }
            >
              {project.featured
                ? "★ Remove from showcase"
                : "☆ Add to showcase"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetailModal;