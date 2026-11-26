
import { useCallback, useEffect, useState } from "react";
import { api } from "../../services/api";
import styles from "./ProjectSubmissionsTab.module.css";

function ProjectSubmissionsTab() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [rejectingProject, setRejectingProject] = useState(null);
  const [remarks, setRemarks] = useState("");

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/projects/admin/pending");
      setProjects(response.data || []);
    } catch (err) {
      setError(err.message || "Failed to load project submissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleApprove = async (projectId) => {
    const confirmed = window.confirm(
      "Are you sure you want to approve this project?"
    );

    if (!confirmed) return;

    try {
      setProcessingId(projectId);
      setError("");

      await api.patch(`/projects/${projectId}/approve`, {});
      await loadProjects();
    } catch (err) {
      setError(err.message || "Failed to approve project.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!remarks.trim()) {
      setError("Please provide remarks before rejecting this project.");
      return;
    }

    try {
      setProcessingId(rejectingProject._id);
      setError("");

      await api.patch(
        `/projects/${rejectingProject._id}/reject`,
        { remarks: remarks.trim() }
      );

      setRejectingProject(null);
      setRemarks("");
      await loadProjects();
    } catch (err) {
      setError(err.message || "Failed to reject project.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        Loading project submissions...
      </div>
    );
  }

  return (
    <div className={styles.projectSubmissions}>
      <div className={styles.submissionsHeading}>
        <div>
          <h2>Project Submissions</h2>
          <p>Review projects submitted by Barangay Personnel.</p>
        </div>

        <button
          type="button"
          className={styles.refreshButton}
          onClick={loadProjects}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <div className={styles.empty}>
          <h3>No Pending Projects</h3>
          <p>
            There are currently no project submissions waiting for review.
          </p>
        </div>
      ) : (
        <div className={styles.projectList}>
          {projects.map((project) => (
            <article
              className={styles.projectCard}
              key={project._id}
            >
              <div className={styles.cardHeader}>
                <div>
                  <span className={styles.pendingStatus}>
                    Pending Review
                  </span>
                  <h3>{project.title}</h3>
                </div>
              </div>

              <p className={styles.description}>
                {project.description}
              </p>

              <div className={styles.details}>
                <p>
                  <strong>Barangay:</strong>{" "}
                  {project.barangay || "Not specified"}
                </p>

                <p>
                  <strong>SDG:</strong>{" "}
                  {project.sdgTags?.length
                    ? project.sdgTags.join(", ")
                    : project.sdgTag || "Not specified"}
                </p>

                <p>
                  <strong>Project Status:</strong>{" "}
                  {project.status || "Not specified"}
                </p>

                <p>
                  <strong>Start Date:</strong>{" "}
                  {project.startDate
                    ? new Date(project.startDate).toLocaleDateString()
                    : "Not specified"}
                </p>

                <p>
                  <strong>End Date:</strong>{" "}
                  {project.endDate
                    ? new Date(project.endDate).toLocaleDateString()
                    : "Not specified"}
                </p>

                <p>
                  <strong>Submitted:</strong>{" "}
                  {project.createdAt
                    ? new Date(project.createdAt).toLocaleDateString()
                    : "Not available"}
                </p>
              </div>

              {project.photos?.length > 0 && (
                <div className={styles.photos}>
                  <strong>Project Photos</strong>

                  <div className={styles.photoList}>
                    {project.photos.map((photo, index) => (
                      <a
                        href={photo}
                        target="_blank"
                        rel="noreferrer"
                        key={`${photo}-${index}`}
                      >
                        View Photo {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {project.document?.path && (
                <div className={styles.document}>
                  <strong>Attached Document:</strong>{" "}
                  {project.document.originalName || "Document attached"}
                  <p>{project.document.path}</p>
                </div>
              )}

              <div className={styles.reviewActions}>
                <button
                  type="button"
                  className={styles.approveButton}
                  disabled={processingId === project._id}
                  onClick={() => handleApprove(project._id)}
                >
                  {processingId === project._id
                    ? "Processing..."
                    : "Approve"}
                </button>

                <button
                  type="button"
                  className={styles.rejectButton}
                  disabled={processingId === project._id}
                  onClick={() => {
                    setRejectingProject(project);
                    setRemarks("");
                    setError("");
                  }}
                >
                  Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {rejectingProject && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3>Reject Project</h3>

            <p>
              Enter the remarks that will be shown to the submitting
              Barangay Personnel.
            </p>

            <textarea
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              placeholder="Explain why this project is being rejected..."
              rows={5}
            />

            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelButton}
                disabled={processingId === rejectingProject._id}
                onClick={() => {
                  setRejectingProject(null);
                  setRemarks("");
                  setError("");
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className={styles.rejectButton}
                disabled={processingId === rejectingProject._id}
                onClick={handleReject}
              >
                {processingId === rejectingProject._id
                  ? "Submitting..."
                  : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectSubmissionsTab;
