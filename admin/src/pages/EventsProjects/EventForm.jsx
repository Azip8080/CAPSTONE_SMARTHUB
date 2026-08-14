import { useState } from "react";
import styles from "./Form.module.css";
import { SDG_OPTIONS, EMPTY_EVENT } from "./constants.js";

function EventForm({ initialData, onClose, onSubmit }) {
  const [form, setForm] = useState(initialData || EMPTY_EVENT);
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
            className={styles.select}
            value={form.sdgTag}
            onChange={(e) => setForm({ ...form, sdgTag: e.target.value })}
          >
            {SDG_OPTIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Date & Time</label>
          <input
            className={styles.input}
            type="datetime-local"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Location</label>
        <input
          className={styles.input}
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          required
        />
      </div>
      <div className={styles.modalFooter}>
        <button type="button" className={styles.cancelBtn} onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className={styles.saveBtn} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

export default EventForm;