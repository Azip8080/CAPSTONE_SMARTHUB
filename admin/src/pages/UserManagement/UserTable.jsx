import styles from "./UserTable.module.css";
import { ROLE_LABELS } from "./constants.js";

const ROLE_CLASS = {
  admin: "roleAdmin",
  barangay_personnel: "rolePersonnel",
  community_member: "roleMember",
};

function UserTable({ loading, users, onEdit, onDelete }) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>User</th>
            <th className={styles.th}>Barangay</th>
            <th className={styles.th}>Role</th>
            <th className={styles.th}>Joined</th>
            <th className={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={5} className={styles.emptyCell}>
                Loading…
              </td>
            </tr>
          )}
          {!loading && users.length === 0 && (
            <tr>
              <td colSpan={5} className={styles.emptyCell}>
                No users found.
              </td>
            </tr>
          )}
          {users.map((user) => (
            <tr key={user._id} className={styles.tr}>
              <td className={styles.td}>
                <div className={styles.userCell}>
                  <div className={styles.avatar}>{user.fullName?.charAt(0).toUpperCase()}</div>
                  <div>
                    <p className={styles.userName}>{user.fullName}</p>
                    <p className={styles.userEmail}>{user.email}</p>
                  </div>
                </div>
              </td>
              <td className={styles.td}>{user.barangay || "—"}</td>
              <td className={styles.td}>
                <span className={`${styles.roleChip} ${styles[ROLE_CLASS[user.role]]}`}>
                  {ROLE_LABELS[user.role]}
                </span>
              </td>
              <td className={styles.td}>
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-PH", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </td>
              <td className={styles.td}>
                <div className={styles.actions}>
                  <button className={styles.editBtn} onClick={() => onEdit(user)}>
                    Edit role
                  </button>
                  <button className={styles.deleteBtn} onClick={() => onDelete(user._id)}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserTable;