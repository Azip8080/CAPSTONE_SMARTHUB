import { useState } from "react";
import styles from "./ProjectFormModal.module.css";
import { SDG_OPTIONS, STATUS_OPTIONS, EMPTY_FORM } from "./constants.js";

function ProjectFormModal({ initialData, isEdit, onClose, onSubmit }) {
  const [form, setForm] = useState(initialData || EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{isEdit ? "Edit project" : "Add project"}</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Title</label>
            <input
              className={styles.input}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>SDG Tag</label>
              <select
                className={styles.select2}
                value={form.sdgTag}
                onChange={(e) => setForm({ ...form, sdgTag: e.target.value })}
              >
                {SDG_OPTIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Status</label>
              <select
                className={styles.select2}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Barangay</label>
            <input
              className={styles.input}
              value={form.barangay}
              onChange={(e) => setForm({ ...form, barangay: e.target.value })}
              required
            />
          </div>
          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? "Saving…" : "Save project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProjectFormModal;