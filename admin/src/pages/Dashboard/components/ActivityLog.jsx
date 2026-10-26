
import styles from "../Dashboard.module.css";

function ActivityLog({ activities = [], loading = false }) {
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
    };

    return (
      actions[action.toLowerCase()] ||
      action ||
      "Performed an action"
    );
  };

  if (loading) {
    return (
      <div className={styles.activityLog}>
        <p className={styles.empty}>Loading activity...</p>
      </div>
    );
  }

  if (!Array.isArray(activities) || activities.length === 0) {
    return (
      <div className={styles.activityLog}>
        <p className={styles.empty}>No recent activity.</p>
      </div>
    );
  }

  return (
    <div className={styles.activityLog}>
      {activities.slice(0, 5).map((activity, index) => {
        const actorName =
          activity.actor?.fullName ||
          activity.actor?.email ||
          "Unknown user";

        const description =
          activity.details ||
          `${formatAction(activity.action)} ${
            activity.entityType || "item"
          }.`;

        return (
          <div
            key={activity._id || `${activity.createdAt}-${index}`}
            className={styles.activityItem}
          >
            <div className={styles.activityDot} />

            <div className={styles.activityContent}>
              <p className={styles.activityTitle}>
                {actorName}
              </p>

              <p className={styles.activityDescription}>
                {description}
              </p>

              {activity.entityTitle && (
                <p className={styles.activityEntity}>
                  {activity.entityTitle}
                </p>
              )}

              <p className={styles.activityTime}>
                {formatDate(activity.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ActivityLog;
