
import { useState } from "react";
import styles from "./Form.module.css";
import { SDG_OPTIONS, EMPTY_EVENT } from "./Constants.js";
import { classifyText } from "../AIClassifier/aiClassifierService";

const BARANGAY_OPTIONS = Array.from(
  { length: 146 },
  (_, i) => `Barangay ${i + 1}`
);

function formatDateTimeLocal(date) {
  if (!date) return "";

  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "";

  const offset = value.getTimezoneOffset();
  const localDate = new Date(value.getTime() - offset * 60000);

  return localDate.toISOString().slice(0, 16);
}

function EventForm({ initialData, onClose, onSubmit }) {
  const initialBarangay = initialData?.barangay || "All Barangays";
  const isSpecific = initialBarangay !== "All Barangays";

  const [scope, setScope] = useState(isSpecific ? "specific" : "all");
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
  const [classifying, setClassifying] = useState(false);
  const [classificationError, setClassificationError] = useState("");
  const [classificationResult, setClassificationResult] = useState(null);
  const [documentName, setDocumentName] = useState(
    initialData?.document?.originalName ||
      initialData?.document?.filename ||
      ""
  );

  const isEditing = Boolean(initialData?._id);

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files?.[0] || null;
    handleChange("document", file);
    setDocumentName(file?.name || "");
  };

  const handleAIClassify = async () => {
    const title = String(form.title || "").trim();
    const description = String(form.description || "").trim();

    if (!title && !description) {
      setClassificationError("Enter an event title or description first.");
      setClassificationResult(null);
      return;
    }

    setClassifying(true);
    setClassificationError("");
    setClassificationResult(null);

    try {
      const response = await classifyText(title, description);
      const result = response?.data ?? response;
      const primarySDG = result?.sdgTag ?? result?.tag;

      if (!primarySDG) {
        throw new Error("The AI did not return a primary SDG. Please try again.");
      }

      const normalizedSDG = String(primarySDG).trim();
      const matchingOption = SDG_OPTIONS.find(
        (option) =>
          String(option).toLowerCase() === normalizedSDG.toLowerCase()
      );

      if (!matchingOption) {
        throw new Error(
          `The AI returned "${normalizedSDG}", which is not in the event SDG options.`
        );
      }

      handleChange("sdgTag", matchingOption);
      setClassificationResult({
        ...result,
        sdgTag: matchingOption,
      });
    } catch (error) {
      setClassificationError(
        error.message || "Unable to classify this event."
      );
    } finally {
      setClassifying(false);
    }
  };

  const filteredBarangays = BARANGAY_OPTIONS.filter((name) =>
    name.toLowerCase().includes(barangaySearch.trim().toLowerCase())
  );

  const handleScopeChange = (newScope) => {
    setScope(newScope);

    if (newScope === "all") {
      handleChange("barangay", "All Barangays");
      setBarangaySearch("");
      return;
    }

    if (form.barangay === "All Barangays") {
      handleChange("barangay", "");
      setBarangaySearch("");
    } else {
      setBarangaySearch(form.barangay);
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
        barangay: scope === "all" ? "All Barangays" : form.barangay,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <header className={styles.formHeader}>
        <div className={styles.headerAccent} />
        <div className={styles.headerContent}>
          <div className={styles.headerIcon} aria-hidden="true">
            <span>◷</span>
          </div>
          <div className={styles.headerText}>
            <span className={styles.eyebrow}>EVENT MANAGEMENT</span>
            <h2 className={styles.formTitle}>
              {isEditing ? "Edit Event" : "Create Event"}
            </h2>
            <p className={styles.formSubtitle}>
              {isEditing
                ? "Update event information and community access."
                : "Create an event and connect it with a Sustainable Development Goal."}
            </p>
          </div>
        </div>
      </header>

      <div className={styles.formBody}>
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>01</span>
              <div>
                <h3 className={styles.sectionTitle}>Event Information</h3>
                <p className={styles.sectionDescription}>
                  Enter the event details and its SDG classification.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="event-title">
              Event Title <span className={styles.required}>*</span>
            </label>
            <input
              id="event-title"
              className={styles.input}
              value={form.title || ""}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Enter event title"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="event-description">
              Description <span className={styles.required}>*</span>
            </label>
            <textarea
              id="event-description"
              className={styles.textarea}
              rows={4}
              value={form.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe the event, its purpose, and expected participants"
              required
            />
          </div>

          <div className={styles.aiSection}>
            <div className={styles.aiHeading}>
              <span className={styles.aiSparkle}>✦</span>
              <div>
                <h4 className={styles.aiTitle}>AI SDG Classification</h4>
                <p className={styles.aiHint}>
                  Automatically suggest the SDG most relevant to this event.
                </p>
              </div>
            </div>

            <button
              type="button"
              className={styles.aiButton}
              onClick={handleAIClassify}
              disabled={classifying || saving}
            >
              {classifying ? "Classifying Event..." : "✦ Classify Event"}
            </button>

            {classificationError && (
              <p className={styles.aiError} role="alert">
                {classificationError}
              </p>
            )}

            {classificationResult && (
              <div className={styles.aiResult} role="status" aria-live="polite">
                <h4 className={styles.aiResultTitle}>
                  Classification Result
                </h4>
                <p className={styles.aiResultText}>
                  Suggested primary SDG:{" "}
                  <strong>{classificationResult.sdgTag}</strong>
                </p>

                {Array.isArray(classificationResult.relatedSDGs) &&
                  classificationResult.relatedSDGs.length > 0 && (
                    <div className={styles.aiTags}>
                      <span className={styles.aiTagsLabel}>
                        Related SDGs
                      </span>
                      {classificationResult.relatedSDGs.map((sdg, index) => (
                        <span className={styles.aiTag} key={`${sdg}-${index}`}>
                          {typeof sdg === "string"
                            ? sdg
                            : sdg?.tag || sdg?.sdgTag || sdg?.name || ""}
                        </span>
                      ))}
                    </div>
                  )}

                <p className={styles.helperText}>
                  Review the recommendation before saving the event.
                </p>
              </div>
            )}
          </div>

          <div className={styles.twoColumn}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="event-sdg">
                SDG Tag <span className={styles.required}>*</span>
              </label>
              <select
                id="event-sdg"
                className={styles.select}
                value={form.sdgTag || ""}
                onChange={(e) => handleChange("sdgTag", e.target.value)}
                required
              >
                <option value="" disabled>
                  Select an SDG
                </option>
                {SDG_OPTIONS.map((sdg) => (
                  <option key={sdg} value={sdg}>
                    {sdg}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="event-date">
                Date &amp; Time <span className={styles.required}>*</span>
              </label>
              <input
                id="event-date"
                className={styles.input}
                type="datetime-local"
                value={form.date || ""}
                onChange={(e) => handleChange("date", e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="event-location">
              Event Location <span className={styles.required}>*</span>
            </label>
            <input
              id="event-location"
              className={styles.input}
              value={form.location || ""}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="Enter the venue or event location"
              required
            />
          </div>
        </section>

        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>02</span>
              <div>
                <h3 className={styles.sectionTitle}>Community Access</h3>
                <p className={styles.sectionDescription}>
                  Choose which barangay members can view the event.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Event Visibility</label>

            <div className={styles.barangayScope}>
              <label
                className={`${styles.barangayScopeOption} ${
                  scope === "all" ? styles.barangayScopeOptionActive : ""
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
                  scope === "specific" ? styles.barangayScopeOptionActive : ""
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
                  <span className={styles.barangaySearchIcon} aria-hidden="true">
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
                  Search and select one of the 146 barangays. Only members
                  of the selected barangay can see this event.
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
        </section>

        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>03</span>
              <div>
                <h3 className={styles.sectionTitle}>Event Document</h3>
                <p className={styles.sectionDescription}>
                  Attach supporting event documentation if available.
                </p>
              </div>
            </div>
            <span className={styles.optionalBadge}>Optional</span>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="event-document">
              Upload Document
            </label>
            <input
              id="event-document"
              className={styles.input}
              type="file"
              accept=".pdf,.txt,.docx"
              onChange={handleDocumentChange}
              disabled={saving}
            />
            {documentName && (
              <div className={styles.documentItem}>
                <div className={styles.documentIcon}>↥</div>
                <div className={styles.documentDetails}>
                  <span className={styles.documentName}>{documentName}</span>
                  <span className={styles.documentMeta}>
                    Selected event document
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => {
                    handleChange("document", null);
                    setDocumentName("");
                  }}
                  disabled={saving}
                  aria-label="Remove selected event document"
                >
                  ×
                </button>
              </div>
            )}
            <p className={styles.helperText}>
              Accepted formats: PDF, TXT, and DOCX.
            </p>
          </div>
        </section>
      </div>

      <div className={styles.formFooter}>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={onClose}
          disabled={saving || classifying}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={styles.saveBtn}
          disabled={saving || classifying}
        >
          {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Event"}
        </button>
      </div>
    </form>
  );
}

export default EventForm;
