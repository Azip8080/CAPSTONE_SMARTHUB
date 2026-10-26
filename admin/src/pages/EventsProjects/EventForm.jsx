
import { useState } from "react";
import styles from "./Form.module.css";
import { SDG_OPTIONS, EMPTY_EVENT } from "./Constants.js";

function formatDateTimeLocal(date) {
  if (!date) return "";

  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "";

  const offset = value.getTimezoneOffset();
  const localDate = new Date(
    value.getTime() - offset * 60 * 1000
  );

  return localDate.toISOString().slice(0, 16);
}

function EventForm({ initialData, onClose, onSubmit }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_EVENT,
    ...initialData,
    date: formatDateTimeLocal(initialData?.date),
    document: null,
  }));

  const [saving, setSaving] = useState(false);
  const [documentName, setDocumentName] = useState(
    initialData?.document?.originalName ||
      initialData?.document?.filename ||
      ""
  );

  const handleChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files?.[0] || null;

    handleChange("document", file);
    setDocumentName(file?.name || "");
  };

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
      <div className={styles.formBody}>
        <div className={styles.field}>
          <label className={styles.label}>Title</label>
          <input
            className={styles.input}
            value={form.title || ""}
            onChange={(e) =>
              handleChange("title", e.target.value)
            }
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textarea}
            rows={3}
            value={form.description || ""}
            onChange={(e) =>
              handleChange("description", e.target.value)
            }
            required
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>SDG Tag</label>
            <select
              className={styles.select}
              value={form.sdgTag || ""}
              onChange={(e) =>
                handleChange("sdgTag", e.target.value)
              }
              required
            >
              {SDG_OPTIONS.map((sdg) => (
                <option key={sdg} value={sdg}>
                  {sdg}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Date &amp; Time</label>
            <input
              className={styles.input}
              type="datetime-local"
              value={form.date || ""}
              onChange={(e) =>
                handleChange("date", e.target.value)
              }
              required
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Location</label>
          <input
            className={styles.input}
            value={form.location || ""}
            onChange={(e) =>
              handleChange("location", e.target.value)
            }
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            Event Document (optional)
          </label>

          <input
            className={styles.input}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            onChange={handleDocumentChange}
          />

          {documentName && (
            <p>
              Selected document: {documentName}
            </p>
          )}

          <small>
            Upload a document that the admin can open from
            the event details.
          </small>
        </div>
      </div>

      <div className={styles.modalFooter}>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={onClose}
          disabled={saving}
        >
          Cancel
        </button>

        <button
          type="submit"
          className={styles.saveBtn}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

export default EventForm;