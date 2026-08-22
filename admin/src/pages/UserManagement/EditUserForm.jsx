import { useState } from "react";
import styles from "./EditUserForm.module.css";
import { ROLE_OPTIONS, ROLE_LABELS } from "./constants.js";

function EditUserForm({ user, onClose, onSubmit }) {
  const [form, setForm] = useState({ role: user.role, barangay: user.barangay || "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className={styles.modalUserInfo}>
        <div className={styles.modalAvatar}>{user.fullName?.charAt(0).toUpperCase()}</div>
        <div>
          <p className={styles.modalUserName}>{user.fullName}</p>
          <p className={styles.modalUserEmail}>{user.email}</p>
        </div>
      </div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label}>Role</label>
          <select
            className={styles.select}
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Barangay</label>
          <input
            className={styles.input}
            value={form.barangay}
            placeholder="e.g. Barangay 1"
            onChange={(e) => setForm({ ...form, barangay: e.target.value })}
          />
        </div>
        <div className={styles.modalFooter}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </>
  );
}

export default EditUserForm;