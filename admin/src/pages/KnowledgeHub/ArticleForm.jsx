import { useState } from "react";
import styles from "./ArticleForm.module.css";
import { SDG_OPTIONS, CATEGORIES, EMPTY_ARTICLE } from "./constants.js";

function ArticleForm({ initialData, onClose, onSubmit }) {
  const [form, setForm] = useState(initialData || EMPTY_ARTICLE);
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
          <label className={styles.label}>Category</label>
          <select
            className={styles.select2}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Content</label>
        <textarea
          className={styles.textarea}
          rows={6}
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
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

export default ArticleForm;