import styles from "../Dashboard.module.css";

function ActivityLog({
  activities,
  loading,
}) {
  const formatDate = (date) => {
    return new Date(
      date
    ).toLocaleString(
      "en-PH",
      {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  const formatAction = (action) => {
    const actions = {
      created: "Created",
      updated: "Updated",
      deleted: "Deleted",
      published: "Published",
      unpublished: "Unpublished",
    };

    return (
      actions[action] || action
    );
  };

  if (loading) {
    return (
      <div
        className={
          styles.activityLog
        }
      >
        <p className={styles.empty}>
          Loading activity...
        </p>
      </div>
    );
  }

  if (!activities.length) {
    return (
      <div
        className={
          styles.activityLog
        }
      >
        <p className={styles.empty}>
          No recent activity.
        </p>
      </div>
    );
  }

  return (
    <div
      className={
        styles.activityLog
      }
    >
      {activities
        .slice(0, 5)
        .map((activity) => (
          <div
            key={activity._id}
            className={
              styles.activityItem
            }
          >
            <div
              className={
                styles.activityDot
              }
            />

            <div
              className={
                styles.activityContent
              }
            >
              <p
                className={
                  styles.activityTitle
                }
              >
                {activity.actor
                  ?.fullName ||
                  "Admin User"}
              </p>

              <p
                className={
                  styles.activityDescription
                }
              >
                {activity.details ||
                  `${formatAction(
                    activity.action
                  )} ${
                    activity.entityType
                  }`}
              </p>

              {activity.entityTitle && (
                <p
                  className={
                    styles.activityEntity
                  }
                >
                  {activity.entityTitle}
                </p>
              )}

              <p
                className={
                  styles.activityTime
                }
              >
                {formatDate(
                  activity.createdAt
                )}
              </p>
            </div>
          </div>
        ))}
    </div>
  );
}

export default ActivityLog;