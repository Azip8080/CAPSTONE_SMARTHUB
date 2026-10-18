// UserTable.jsx

import styles from "./UserTable.module.css";
import { ROLE_LABELS } from "./constants.js";

const ROLE_CLASS = {
  admin: "roleAdmin",
  barangay_personnel: "rolePersonnel",
  community_member: "roleMember",
};

function UserTable({
  loading,
  users,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  actionLoading,
}) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>User</th>
            <th className={styles.th}>Barangay</th>
            <th className={styles.th}>Role</th>
            <th className={styles.th}>Status</th>
            <th className={styles.th}>Joined</th>
            <th className={styles.th}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td colSpan={6} className={styles.emptyCell}>
                Loading…
              </td>
            </tr>
          )}

          {!loading && users.length === 0 && (
            <tr>
              <td colSpan={6} className={styles.emptyCell}>
                No users found.
              </td>
            </tr>
          )}

          {!loading &&
            users.map((user) => {
              const status =
                user.accountStatus || "Pending";

              const isPendingCommunityMember =
                user.role === "community_member" &&
                status === "Pending";

              return (
                <tr key={user._id} className={styles.tr}>
                  <td className={styles.td}>
                    <div className={styles.userCell}>
                      <div className={styles.avatar}>
                        {user.fullName?.charAt(0).toUpperCase() || "U"}
                      </div>

                      <div>
                        <p className={styles.userName}>
                          {user.fullName}
                        </p>
                        <p className={styles.userEmail}>
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className={styles.td}>
                    {user.barangay || "—"}
                  </td>

                  <td className={styles.td}>
                    <span
                      className={`${styles.roleChip} ${
                        styles[ROLE_CLASS[user.role]]
                      }`}
                    >
                      {ROLE_LABELS[user.role] || user.role}
                    </span>
                  </td>

                  <td className={styles.td}>
                    <span
                      className={`${styles.statusChip} ${
                        styles[`status${status}`]
                      }`}
                    >
                      {status}
                    </span>

                    {status === "Rejected" &&
                      user.verification?.rejectionReason && (
                        <p className={styles.rejectionReason}>
                          Reason: {user.verification.rejectionReason}
                        </p>
                      )}
                  </td>

                  <td className={styles.td}>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString(
                          "en-PH",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )
                      : "—"}
                  </td>

                  <td className={styles.td}>
                    <div className={styles.actions}>
                      {isPendingCommunityMember && (
                        <>
                          <button
                            type="button"
                            className={styles.approveBtn}
                            onClick={() => onApprove(user)}
                            disabled={actionLoading}
                          >
                            Approve
                          </button>

                          <button
                            type="button"
                            className={styles.rejectBtn}
                            onClick={() => onReject(user)}
                            disabled={actionLoading}
                          >
                            Reject
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        className={styles.editBtn}
                        onClick={() => onEdit(user)}
                      >
                        Edit role
                      </button>

                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => onDelete(user._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

export default UserTable;