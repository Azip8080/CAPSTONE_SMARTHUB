import styles from "./ProjectTable.module.css";

import {
  STATUS_COLORS,
  PUBLICATION_STATUS_COLORS,
} from "./constants.js";

function ProjectTable({
  loading,
  error,
  projects,
  onEdit,
  onRequestDelete,
  onPublish,
  onUnpublish,
}) {
  if (loading) {
    return (
      <p
        className={
          styles.status
        }
      >
        Loading…
      </p>
    );
  }

  if (error) {
    return (
      <p
        className={
          styles.statusError
        }
      >
        {error}
      </p>
    );
  }

  return (
    <table
      className={styles.table}
    >
      <thead>
        <tr>
          <th
            className={
              styles.th
            }
          >
            Title
          </th>

          <th
            className={
              styles.th
            }
          >
            SDG
          </th>

          <th
            className={
              styles.th
            }
          >
            Barangay
          </th>

          <th
            className={
              styles.th
            }
          >
            Status
          </th>

          <th
            className={
              styles.th
            }
          >
            Publication
          </th>

          <th
            className={
              styles.th
            }
          >
            Actions
          </th>
        </tr>
      </thead>

      <tbody>
        {projects.length === 0 ? (
          <tr>
            <td
              colSpan={6}
              className={
                styles.empty
              }
            >
              No projects found.
            </td>
          </tr>
        ) : (
          projects.map((project) => {
            const statusStyle =
              STATUS_COLORS[
                project.status
              ] ||
              STATUS_COLORS.Planned;

            const publicationStatus =
              project.publicationStatus ||
              "Draft";

            const publicationStyle =
              PUBLICATION_STATUS_COLORS[
                publicationStatus
              ] ||
              PUBLICATION_STATUS_COLORS.Draft;

            const isPublished =
              publicationStatus ===
              "Published";

            return (
              <tr
                key={project._id}
                className={
                  styles.tr
                }
              >
                <td
                  className={
                    styles.td
                  }
                >
                  <p
                    className={
                      styles.tdTitle
                    }
                  >
                    {project.title}
                  </p>

                  <p
                    className={
                      styles.tdSub
                    }
                  >
                    {project.description?.slice(
                      0,
                      60
                    )}
                    …
                  </p>
                </td>

                <td
                  className={
                    styles.td
                  }
                >
                  <span
                    className={
                      styles.sdgChip
                    }
                  >
                    {project.sdgTag}
                  </span>
                </td>

                <td
                  className={
                    styles.td
                  }
                >
                  {project.barangay}
                </td>

                <td
                  className={
                    styles.td
                  }
                >
                  <span
                    className={
                      styles.statusChip
                    }
                    style={{
                      background:
                        statusStyle.bg,
                      color:
                        statusStyle.color,
                    }}
                  >
                    {project.status}
                  </span>
                </td>

                <td
                  className={
                    styles.td
                  }
                >
                  <span
                    className={
                      styles.statusChip
                    }
                    style={{
                      background:
                        publicationStyle.bg,
                      color:
                        publicationStyle.color,
                    }}
                  >
                    {
                      publicationStatus
                    }
                  </span>
                </td>

                <td
                  className={
                    styles.td
                  }
                >
                  <div
                    className={
                      styles.actions
                    }
                  >
                    <button
                      className={
                        styles.editBtn
                      }
                      onClick={() =>
                        onEdit(
                          project
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      className={
                        styles.deleteBtn
                      }
                      onClick={() =>
                        onRequestDelete(
                          project._id
                        )
                      }
                    >
                      Delete
                    </button>

                    {isPublished ? (
                      <button
                        className={
                          styles.unpublishBtn
                        }
                        onClick={() =>
                          onUnpublish(
                            project._id
                          )
                        }
                      >
                        Unpublish
                      </button>
                    ) : (
                      <button
                        className={
                          styles.publishBtn
                        }
                        onClick={() =>
                          onPublish(
                            project._id
                          )
                        }
                      >
                        Publish
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}

export default ProjectTable;