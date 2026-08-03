import styles from "./ProjectTable.module.css";
import { STATUS_COLORS } from "./constants.js";

function ProjectTable({ loading, error, projects, onEdit, onRequestDelete }) {
  if (loading) return <p className={styles.status}>Loading…</p>;
  if (error) return <p className={styles.statusError}>{error}</p>;

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.th}>Title</th>
          <th className={styles.th}>SDG</th>
          <th className={styles.th}>Barangay</th>
          <th className={styles.th}>Status</th>
          <th className={styles.th}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {projects.length === 0 ? (
          <tr>
            <td colSpan={5} className={styles.empty}>
              No projects found.
            </td>
          </tr>
        ) : (
          projects.map((p) => {
            const statusStyle = STATUS_COLORS[p.status] || STATUS_COLORS.Planned;
            return (
              <tr key={p._id} className={styles.tr}>
                <td className={styles.td}>
                  <p className={styles.tdTitle}>{p.title}</p>
                  <p className={styles.tdSub}>{p.description?.slice(0, 60)}…</p>
                </td>
                <td className={styles.td}>
                  <span className={styles.sdgChip}>{p.sdgTag}</span>
                </td>
                <td className={styles.td}>{p.barangay}</td>
                <td className={styles.td}>
                  <span
                    className={styles.statusChip}
                    style={{ background: statusStyle.bg, color: statusStyle.color }}
                  >
                    {p.status}
                  </span>
                </td>
                <td className={styles.td}>
                  <div className={styles.actions}>
                    <button className={styles.editBtn} onClick={() => onEdit(p)}>
                      Edit
                    </button>
                    <button className={styles.deleteBtn} onClick={() => onRequestDelete(p._id)}>
                      Delete
                    </button>
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