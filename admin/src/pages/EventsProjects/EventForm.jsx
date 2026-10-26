
import { useState } from "react";
import styles from "./Form.module.css";
import { SDG_OPTIONS, EMPTY_EVENT } from "./Constants.js";

const BARANGAY_OPTIONS = Array.from(
  { length: 146 },
  (_, i) => `Barangay ${i + 1}`
);

function formatDateTimeLocal(date) {
  if (!date) return "";

  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "";

  const offset = value.getTimezoneOffset();
  const localDate = new Date(value.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

function EventForm({ initialData, onClose, onSubmit }) {
  const initialBarangay = initialData?.barangay || "All Barangays";
  const isSpecific = initialBarangay !== "All Barangays";

  const [scope, setScope] = useState(
    isSpecific ? "specific" : "all"
  );

  const [form, setForm] = useState(() => ({
    ...EMPTY_EVENT,
    ...initialData,
    barangay: initialBarangay,
    date: formatDateTimeLocal(initialData?.date),
    document: null,
  }));

  const [barangaySearch, setBarangaySearch] = useState(
    isSpecific ? initialBarangay : ""
  );

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

  const filteredBarangays = BARANGAY_OPTIONS.filter((name) =>
    name.toLowerCase().includes(barangaySearch.trim().toLowerCase())
  );

  const handleScopeChange = (newScope) => {
    setScope(newScope);

    if (newScope === "all") {
      handleChange("barangay", "All Barangays");
      setBarangaySearch("");
    } else {
      const current = form.barangay;
      if (current === "All Barangays") {
        handleChange("barangay", "");
        setBarangaySearch("");
      } else {
        setBarangaySearch(current);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      scope === "specific" &&
      !BARANGAY_OPTIONS.includes(form.barangay)
    ) {
      alert("Please select a valid barangay from the suggestions.");
      return;
    }

    setSaving(true);

    try {
      await onSubmit({
        ...form,
        barangay:
          scope === "all" ? "All Barangays" : form.barangay,
      });
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
            onChange={(e) => handleChange("title", e.target.value)}
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
              onChange={(e) => handleChange("sdgTag", e.target.value)}
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
              onChange={(e) => handleChange("date", e.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Event Barangay</label>

          <div className={styles.barangayScope}>
            <label
              className={`${styles.barangayScopeOption} ${
                scope === "all"
                  ? styles.barangayScopeOptionActive
                  : ""
              }`}
            >
              <input
                type="radio"
                name="barangayScope"
                checked={scope === "all"}
                onChange={() => handleScopeChange("all")}
              />
              All Barangays
            </label>

            <label
              className={`${styles.barangayScopeOption} ${
                scope === "specific"
                  ? styles.barangayScopeOptionActive
                  : ""
              }`}
            >
              <input
                type="radio"
                name="barangayScope"
                checked={scope === "specific"}
                onChange={() => handleScopeChange("specific")}
              />
              Specific Barangay
            </label>
          </div>

          {scope === "specific" && (
            <>
              <div className={styles.barangaySearchWrapper}>
                <span
                  className={styles.barangaySearchIcon}
                  aria-hidden="true"
                >
                  ⌕
                </span>

                <input
                  className={styles.barangaySearch}
                  list="event-barangay-options"
                  value={barangaySearch}
                  onChange={(e) => {
                    const value = e.target.value;
                    setBarangaySearch(value);
                    handleChange("barangay", value);
                  }}
                  placeholder="Search barangay 1–146"
                  autoComplete="off"
                  required
                />

                {barangaySearch && (
                  <button
                    type="button"
                    className={styles.barangaySearchClear}
                    aria-label="Clear barangay search"
                    onClick={() => {
                      setBarangaySearch("");
                      handleChange("barangay", "");
                    }}
                  >
                    ×
                  </button>
                )}

                <datalist id="event-barangay-options">
                  {filteredBarangays.map((barangay) => (
                    <option key={barangay} value={barangay} />
                  ))}
                </datalist>
              </div>

              <p className={styles.barangayHelp}>
                Search and select one of the 146 barangays. Only
                members of the selected barangay can see this event.
              </p>
            </>
          )}

          {scope === "all" && (
            <div className={styles.barangayStatus}>
              <div className={styles.barangayStatusIcon}>◎</div>
              <div>
                <p className={styles.barangayStatusTitle}>
                  Available to everyone
                </p>
                <p className={styles.barangayStatusDescription}>
                  Members from all barangays can view this event.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Location</label>
          <input
            className={styles.input}
            value={form.location || ""}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="e.g. Manila Public Library Computer Center"
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
            accept=".pdf,.txt,.docx"
            onChange={handleDocumentChange}
          />

          {documentName && <p>Selected document: {documentName}</p>}

          <small>Upload a PDF, TXT, or DOCX document.</small>
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
