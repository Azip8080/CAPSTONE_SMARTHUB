
import { useState } from "react";
import styles from "./ActivityLog.module.css";

function ActivityLog({
  activities = [],
  loading = false,
  onClearAll,
  clearing = false,
}) {
  const [selectedActivity, setSelectedActivity] = useState(null);

  const formatDate = (value) => {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatAction = (action = "") => {
    const actions = {
      created: "Created",
      updated: "Updated",
      deleted: "Deleted",
      published: "Published",
      unpublished: "Unpublished",
      approved: "Approved",
      rejected: "Rejected",
    };

    return actions[action.toLowerCase()] || action || "Performed an action";
  };

  const getActor = (activity) =>
    activity.actor?.fullName ||
    activity.actor?.email ||
    "Unknown user";

  const getDescription = (activity) =>
    activity.details ||
    `${formatAction(activity.action)} ${activity.entityType || "item"}.`;

  const getFileUrl = (activity) =>
    activity.fileUrl ||
    activity.file?.url ||
    activity.file?.path ||
    activity.documentUrl ||
    activity.entityUrl ||
    "";

  const handleClearAll = async () => {
    if (
      !activities.length ||
      !onClearAll ||
      clearing
    ) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to clear all activity logs? This action cannot be undone."
    );

    if (confirmed) {
      await onClearAll();
      setSelectedActivity(null);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setSelectedActivity(null);
    }
  };

  return (
    <section className={styles.activitySection}>
      <div className={styles.activityHeader}>
        <div>
          <h3 className={styles.activityHeading}>Activity Log</h3>
          <p className={styles.activitySubtitle}>
            Click an activity to view its details
          </p>
        </div>

        <button
          type="button"
          className={styles.clearButton}
          onClick={handleClearAll}
          disabled={
            loading ||
            clearing ||
            activities.length === 0 ||
            !onClearAll
          }
        >
          {clearing ? "Clearing..." : "Clear All"}
        </button>
      </div>

      <div className={styles.activityLog}>
        {loading ? (
          <p className={styles.empty}>Loading activity...</p>
        ) : !Array.isArray(activities) || activities.length === 0 ? (
          <p className={styles.empty}>No recent activity.</p>
        ) : (
          <div className={styles.activityList}>
            {activities.slice(0, 10).map((activity, index) => (
              <button
                type="button"
                key={activity._id || `${activity.createdAt}-${index}`}
                className={styles.activityItem}
                onClick={() => setSelectedActivity(activity)}
                aria-label={`View activity: ${getDescription(activity)}`}
              >
                <span className={styles.activityDot} />

                <span className={styles.activityContent}>
                  <span className={styles.activityTitle}>
                    {getActor(activity)}
                  </span>

                  <span className={styles.activityDescription}>
                    {getDescription(activity)}
                  </span>

                  {activity.entityTitle && (
                    <span className={styles.activityEntity}>
                      {activity.entityTitle}
                    </span>
                  )}

                  <span className={styles.activityTime}>
                    {formatDate(activity.createdAt)}
                  </span>
                </span>

                <span className={styles.activityArrow} aria-hidden="true">
                  ›
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedActivity && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedActivity(null);
            }
          }}
          onKeyDown={handleKeyDown}
        >
          <section
            className={styles.detailModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="activity-detail-title"
          >
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.modalEyebrow}>
                  SYSTEM HISTORY
                </span>
                <h3
                  id="activity-detail-title"
                  className={styles.modalTitle}
                >
                  Activity Details
                </h3>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setSelectedActivity(null)}
                aria-label="Close activity details"
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.actionBadge}>
                {formatAction(selectedActivity.action)}
              </div>

              <div className={styles.detailGroup}>
                <span className={styles.detailLabel}>Performed by</span>
                <p className={styles.detailValue}>
                  {getActor(selectedActivity)}
                </p>
              </div>

              <div className={styles.detailGroup}>
                <span className={styles.detailLabel}>Description</span>
                <p className={styles.detailValue}>
                  {getDescription(selectedActivity)}
                </p>
              </div>

              <div className={styles.detailGroup}>
                <span className={styles.detailLabel}>Affected item type</span>
                <p className={styles.detailValue}>
                  {selectedActivity.entityType || "Not specified"}
                </p>
              </div>

              <div className={styles.detailGroup}>
                <span className={styles.detailLabel}>Record or file name</span>
                <p className={styles.detailValue}>
                  {selectedActivity.entityTitle ||
                    selectedActivity.file?.name ||
                    selectedActivity.fileName ||
                    "Not specified"}
                </p>
              </div>

              <div className={styles.detailGroup}>
                <span className={styles.detailLabel}>Date and time</span>
                <p className={styles.detailValue}>
                  {formatDate(selectedActivity.createdAt)}
                </p>
              </div>

              {selectedActivity.reason && (
                <div className={styles.detailGroup}>
                  <span className={styles.detailLabel}>Reason</span>
                  <p className={styles.detailValue}>
                    {selectedActivity.reason}
                  </p>
                </div>
              )}

              {(selectedActivity.before ||
                selectedActivity.oldData) && (
                <div className={styles.changeSection}>
                  <h4>Previous values</h4>
                  <pre className={styles.changeData}>
                    {JSON.stringify(
                      selectedActivity.before ||
                        selectedActivity.oldData,
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}

              {(selectedActivity.after ||
                selectedActivity.newData) && (
                <div className={styles.changeSection}>
                  <h4>Updated values</h4>
                  <pre className={styles.changeData}>
                    {JSON.stringify(
                      selectedActivity.after ||
                        selectedActivity.newData,
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}

              {getFileUrl(selectedActivity) && (
                <div className={styles.fileSection}>
                  <span className={styles.detailLabel}>
                    Related file
                  </span>

                  <a
                    className={styles.fileLink}
                    href={getFileUrl(selectedActivity)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open file ↗
                  </a>
                </div>
              )}

              {!selectedActivity.before &&
                !selectedActivity.oldData &&
                !selectedActivity.after &&
                !selectedActivity.newData && (
                  <p className={styles.historyNotice}>
                    Detailed before-and-after history is not available
                    for this activity. Only the recorded event details
                    can be displayed.
                  </p>
                )}
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.doneButton}
                onClick={() => setSelectedActivity(null)}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

export default ActivityLog;
