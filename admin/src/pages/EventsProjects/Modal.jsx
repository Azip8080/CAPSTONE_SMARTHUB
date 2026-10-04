import styles from "./Modal.module.css";

function Modal({ title, onClose, children }) {
  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
    >
      <div
        className={styles.modal}
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {title}
          </h2>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

export default Modal;