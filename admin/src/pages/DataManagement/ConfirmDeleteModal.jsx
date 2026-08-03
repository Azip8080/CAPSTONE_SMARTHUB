import styles from "./ConfirmDeleteModal.module.css";

function ConfirmDeleteModal({ onCancel, onConfirm }) {
  return (
    <div className={styles.backdrop} onClick={onCancel}>
      <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.confirmTitle}>Delete project?</h3>
        <p className={styles.confirmText}>This action cannot be undone.</p>
        <div className={styles.confirmActions}>
          <button className={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
          <button className={styles.deleteConfirmBtn} onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;