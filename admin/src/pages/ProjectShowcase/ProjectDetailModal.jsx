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

  const primaryColor =
    SDG_COLORS[project.sdgTag] ||
    "#0f172a";

  const status =
    STATUS_STYLES[project.status] ||
    STATUS_STYLES.Planned;

  const sdgs =
    Array.isArray(project.sdgTags) &&
    project.sdgTags.length > 0
      ? project.sdgTags
      : project.sdgTag
        ? [project.sdgTag]
        : [];

  const tags =
    Array.isArray(project.tags)
      ? project.tags
      : [];

  const photos =
    Array.isArray(project.photos)
      ? project.photos
      : [];

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
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div
          className={styles.modalHeader}
          style={{
            borderTop:
              `4px solid ${primaryColor}`,
          }}
        >
          <div
            className={
              styles.headerTop
            }
          >
            <span
              className={
                styles.headerLabel
              }
            >
              PROJECT DETAILS
            </span>

            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div
            className={styles.badges}
          >
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

            {project.featured && (
              <span
                className={
                  styles.featuredBadge
                }
              >
                ★ Featured
              </span>
            )}
          </div>

          <h2
            className={styles.modalTitle}
          >
            {project.title}
          </h2>

          <p
            className={
              styles.modalBarangay
            }
          >
            📍 {project.barangay}
          </p>
        </div>

        <div
          className={styles.modalBody}
        >
          <section
            className={styles.gallerySection}
          >
            <div
              className={
                styles.sectionHeading
              }
            >
              <h3>Project Photos</h3>

              <span>
                {photos.length} photo
                {photos.length !== 1
                  ? "s"
                  : ""}
              </span>
            </div>

            {photos.length > 0 ? (
              <div
                className={
                  styles.photoGrid
                }
              >
                {photos.map(
                  (photo, index) => (
                    <div
                      key={`${photo}-${index}`}
                      className={
                        index === 0
                          ? styles.primaryPhoto
                          : styles.secondaryPhoto
                      }
                    >
                      <img
                        src={`http://localhost:5000${photo}`}
                        alt={`${project.title} ${
                          index + 1
                        }`}
                      />
                    </div>
                  )
                )}
              </div>
            ) : (
              <div
                className={
                  styles.photoEmpty
                }
              >
                No project photos available.
              </div>
            )}
          </section>

          <section
            className={styles.infoSection}
          >
            <h3>Project Description</h3>

            <p
              className={
                styles.modalDesc
              }
            >
              {project.description ||
                "No project description available."}
            </p>
          </section>

          {tags.length > 0 && (
            <section
              className={styles.infoSection}
            >
              <h3>Project Tags</h3>

              <div
                className={styles.tags}
              >
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className={styles.tag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section
            className={
              styles.showcaseSection
            }
          >
            <div>
              <h3>Project Showcase</h3>

              <p>
                {project.featured
                  ? "This project is currently displayed in the public project showcase."
                  : "This project is not currently displayed in the public project showcase."}
              </p>
            </div>

            <span
              className={
                project.featured
                  ? styles.showcaseActive
                  : styles.showcaseInactive
              }
            >
              {project.featured
                ? "Featured"
                : "Not Featured"}
            </span>
          </section>

          <div
            className={styles.modalActions}
          >
            <button
              type="button"
              className={styles.editBtn}
              onClick={() =>
                setEditing(true)
              }
            >
              Edit Project
            </button>

            <button
              type="button"
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