import { useMemo, useState } from "react";
import styles from "./Form.module.css";
import { SDG_OPTIONS, EMPTY_EVENT } from "./Constants.js";
import { classifyText } from "../AIClassifier/aiClassifierService";

const BARANGAY_OPTIONS = Array.from(
  { length: 146 },
  (_, index) => `Barangay ${index + 1}`
);

function formatDate(date) {
  if (!date) return "";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return "";

  const offset = value.getTimezoneOffset();
  const localDate = new Date(value.getTime() - offset * 60000);

  return localDate.toISOString().slice(0, 10);
}

function normalizeBarangays(event) {
  if (Array.isArray(event?.barangays) && event.barangays.length > 0) {
    return event.barangays;
  }

  if (
    event?.barangay &&
    event.barangay !== "All Barangays"
  ) {
    return [event.barangay];
  }

  return [];
}

function EventForm({ initialData, onClose, onSubmit }) {
  const initialBarangays = normalizeBarangays(initialData);

  const isAllBarangays =
    !initialData ||
    (
      initialData.barangay === "All Barangays" &&
      initialBarangays.length === 0
    );

  const [scope, setScope] = useState(
    isAllBarangays ? "all" : "specific"
  );

  const [selectedBarangays, setSelectedBarangays] = useState(
    initialBarangays
  );

  const [form, setForm] = useState(() => ({
    ...EMPTY_EVENT,
    ...initialData,
    date: formatDate(initialData?.date),
    startTime: initialData?.startTime || "",
    endTime: initialData?.endTime || "",
    document: null,
  }));

  const [barangaySearch, setBarangaySearch] = useState("");
  const [barangayDropdownOpen, setBarangayDropdownOpen] =
    useState(false);

  const [saving, setSaving] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [classificationError, setClassificationError] =
    useState("");
  const [classificationResult, setClassificationResult] =
    useState(null);

  const [documentName, setDocumentName] = useState(
    initialData?.document?.originalName ||
      initialData?.document?.filename ||
      ""
  );

  const isEditing = Boolean(initialData?._id);

  const handleChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleDocumentChange = (event) => {
    const file = event.target.files?.[0] || null;

    handleChange("document", file);
    setDocumentName(file?.name || "");
  };

  const handleAIClassify = async () => {
    const title = String(form.title || "").trim();
    const description = String(form.description || "").trim();

    if (!title && !description) {
      setClassificationError(
        "Enter an event title or description first."
      );
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
        throw new Error(
          "The AI did not return a primary SDG. Please try again."
        );
      }

      const normalizedSDG = String(primarySDG).trim();

      const matchingOption = SDG_OPTIONS.find(
        (option) =>
          String(option).toLowerCase() ===
          normalizedSDG.toLowerCase()
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

  const filteredBarangays = useMemo(() => {
    const search = barangaySearch.trim().toLowerCase();

    return BARANGAY_OPTIONS.filter((barangay) =>
      barangay.toLowerCase().includes(search)
    );
  }, [barangaySearch]);

  const toggleBarangay = (barangay) => {
    setSelectedBarangays((current) =>
      current.includes(barangay)
        ? current.filter((item) => item !== barangay)
        : [...current, barangay]
    );
  };

  const removeBarangay = (barangay) => {
    setSelectedBarangays((current) =>
      current.filter((item) => item !== barangay)
    );
  };

  const handleScopeChange = (newScope) => {
    setScope(newScope);
    setBarangaySearch("");
    setBarangayDropdownOpen(false);

    if (newScope === "all") {
      setSelectedBarangays([]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (scope === "specific" && selectedBarangays.length === 0) {
      alert("Please select at least one barangay.");
      return;
    }

    if (
      form.startTime &&
      form.endTime &&
      form.endTime <= form.startTime
    ) {
      alert("The end time must be later than the start time.");
      return;
    }

    if (!form.date) {
      alert("Please select an event date.");
      return;
    }

    setSaving(true);

    try {
      await onSubmit({
        ...form,
        barangay:
          scope === "all"
            ? "All Barangays"
            : selectedBarangays[0] || "",
        barangays:
          scope === "all"
            ? []
            : selectedBarangays,
        date: form.date,
        startTime: form.startTime || "",
        endTime: form.endTime || "",
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
            <span className={styles.eyebrow}>
              EVENT MANAGEMENT
            </span>

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
                <h3 className={styles.sectionTitle}>
                  Event Information
                </h3>

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
              onChange={(event) =>
                handleChange("title", event.target.value)
              }
              placeholder="Enter event title"
              required
            />
          </div>

          <div className={styles.field}>
            <label
              className={styles.label}
              htmlFor="event-description"
            >
              Description <span className={styles.required}>*</span>
            </label>

            <textarea
              id="event-description"
              className={styles.textarea}
              rows={4}
              value={form.description || ""}
              onChange={(event) =>
                handleChange("description", event.target.value)
              }
              placeholder="Describe the event, its purpose, and expected participants"
              required
            />
          </div>

          <div className={styles.aiSection}>
            <div className={styles.aiHeading}>
              <span className={styles.aiSparkle}>✦</span>

              <div>
                <h4 className={styles.aiTitle}>
                  AI SDG Classification
                </h4>

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
              {classifying
                ? "Classifying Event..."
                : "✦ Classify Event"}
            </button>

            {classificationError && (
              <p className={styles.aiError} role="alert">
                {classificationError}
              </p>
            )}

            {classificationResult && (
              <div
                className={styles.aiResult}
                role="status"
                aria-live="polite"
              >
                <h4 className={styles.aiResultTitle}>
                  Classification Result
                </h4>

                <p className={styles.aiResultText}>
                  Suggested primary SDG:{" "}
                  <strong>
                    {classificationResult.sdgTag}
                  </strong>
                </p>

                {Array.isArray(
                  classificationResult.relatedSDGs
                ) &&
                  classificationResult.relatedSDGs.length > 0 && (
                    <div className={styles.aiTags}>
                      <span className={styles.aiTagsLabel}>
                        Related SDGs
                      </span>

                      {classificationResult.relatedSDGs.map(
                        (sdg, index) => (
                          <span
                            className={styles.aiTag}
                            key={`${sdg}-${index}`}
                          >
                            {typeof sdg === "string"
                              ? sdg
                              : sdg?.tag ||
                                sdg?.sdgTag ||
                                sdg?.name ||
                                ""}
                          </span>
                        )
                      )}
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
                onChange={(event) =>
                  handleChange("sdgTag", event.target.value)
                }
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
                Event Date <span className={styles.required}>*</span>
              </label>

              <input
                id="event-date"
                className={styles.input}
                type="date"
                value={form.date || ""}
                onChange={(event) =>
                  handleChange("date", event.target.value)
                }
                required
              />
            </div>
          </div>

          <div className={styles.twoColumn}>
            <div className={styles.field}>
              <label
                className={styles.label}
                htmlFor="event-start-time"
              >
                Starting Time
              </label>

              <input
                id="event-start-time"
                className={styles.input}
                type="time"
                value={form.startTime || ""}
                onChange={(event) =>
                  handleChange("startTime", event.target.value)
                }
              />
            </div>

            <div className={styles.field}>
              <label
                className={styles.label}
                htmlFor="event-end-time"
              >
                Ending Time
              </label>

              <input
                id="event-end-time"
                className={styles.input}
                type="time"
                value={form.endTime || ""}
                onChange={(event) =>
                  handleChange("endTime", event.target.value)
                }
              />
            </div>
          </div>

          <p className={styles.helperText}>
            Starting and ending times are optional. If provided,
            the ending time must be later than the starting time.
          </p>

          <div className={styles.field}>
            <label
              className={styles.label}
              htmlFor="event-location"
            >
              Event Location <span className={styles.required}>*</span>
            </label>

            <input
              id="event-location"
              className={styles.input}
              value={form.location || ""}
              onChange={(event) =>
                handleChange("location", event.target.value)
              }
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
                <h3 className={styles.sectionTitle}>
                  Community Access
                </h3>

                <p className={styles.sectionDescription}>
                  Choose which barangay members can view the event.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              Event Visibility
            </label>

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
                Specific Barangays
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
                    value={barangaySearch}
                    onChange={(event) => {
                      setBarangaySearch(event.target.value);
                      setBarangayDropdownOpen(true);
                    }}
                    onFocus={() =>
                      setBarangayDropdownOpen(true)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        setBarangayDropdownOpen(false);
                      }
                    }}
                    placeholder="Search barangay 1–146"
                    autoComplete="off"
                    aria-label="Search barangays"
                    aria-expanded={barangayDropdownOpen}
                  />

                  {barangaySearch && (
                    <button
                      type="button"
                      className={styles.barangaySearchClear}
                      aria-label="Clear barangay search"
                      onClick={() => {
                        setBarangaySearch("");
                        setBarangayDropdownOpen(true);
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>

                {barangayDropdownOpen && (
                  <div
                    className={styles.barangaySearchWrapper}
                    style={{
                      display: "block",
                      marginTop: "6px",
                      maxHeight: "200px",
                      overflowY: "auto",
                      border: "1px solid #D5DFED",
                      borderRadius: "8px",
                      background: "#FFFFFF",
                      padding: "6px",
                    }}
                  >
                    {filteredBarangays.length > 0 ? (
                      filteredBarangays.map((barangay) => {
                        const selected =
                          selectedBarangays.includes(barangay);

                        return (
                          <label
                            key={barangay}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              padding: "9px 10px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              background: selected
                                ? "#EFF6FF"
                                : "#FFFFFF",
                              color: "#24364B",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() =>
                                toggleBarangay(barangay)
                              }
                            />

                            <span>{barangay}</span>
                          </label>
                        );
                      })
                    ) : (
                      <p
                        style={{
                          padding: "10px",
                          margin: 0,
                          color: "#64748B",
                          fontSize: "13px",
                        }}
                      >
                        No matching barangays found.
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  className={styles.barangaySearchClear}
                  style={{
                    position: "static",
                    marginTop: "8px",
                    padding: "5px 0",
                  }}
                  onClick={() =>
                    setBarangayDropdownOpen((current) => !current)
                  }
                >
                  {barangayDropdownOpen
                    ? "Close barangay list"
                    : "Select barangays"}
                </button>

                <div style={{ marginTop: "14px" }}>
                  <p className={styles.label}>
                    Selected Barangays ({selectedBarangays.length})
                  </p>

                  {selectedBarangays.length > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                        marginTop: "8px",
                      }}
                    >
                      {selectedBarangays.map((barangay) => (
                        <span
                          key={barangay}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "7px",
                            padding: "7px 10px",
                            borderRadius: "20px",
                            background: "#EFF6FF",
                            border: "1px solid #BFDBFE",
                            color: "#1D4ED8",
                            fontSize: "13px",
                          }}
                        >
                          {barangay}

                          <button
                            type="button"
                            onClick={() =>
                              removeBarangay(barangay)
                            }
                            aria-label={`Remove ${barangay}`}
                            style={{
                              border: 0,
                              background: "transparent",
                              color: "#1D4ED8",
                              cursor: "pointer",
                              fontSize: "16px",
                              lineHeight: 1,
                              padding: 0,
                            }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.barangayHelp}>
                      No barangays selected yet. Search and select
                      at least one barangay.
                    </p>
                  )}
                </div>

                <p className={styles.barangayHelp}>
                  Select one or more barangays. Only members of
                  the selected barangays can view this event.
                </p>
              </>
            )}

            {scope === "all" && (
              <div className={styles.barangayStatus}>
                <div className={styles.barangayStatusIcon}>
                  ◎
                </div>

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
                <h3 className={styles.sectionTitle}>
                  Event Document
                </h3>

                <p className={styles.sectionDescription}>
                  Attach supporting event documentation if available.
                </p>
              </div>
            </div>

            <span className={styles.optionalBadge}>
              Optional
            </span>
          </div>

          <div className={styles.field}>
            <label
              className={styles.label}
              htmlFor="event-document"
            >
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
                  <span className={styles.documentName}>
                    {documentName}
                  </span>

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
          {saving
            ? "Saving..."
            : isEditing
              ? "Save Changes"
              : "Create Event"}
        </button>
      </div>
    </form>
  );
}

export default EventForm;