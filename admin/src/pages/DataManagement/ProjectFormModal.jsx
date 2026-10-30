import { useEffect, useState } from "react";
import styles from "./ProjectFormModal.module.css";
import {
  SDG_OPTIONS,
  STATUS_OPTIONS,
  EMPTY_FORM,
} from "./constants.js";
import useAIClassification from "../AIClassifier/hooks/useAIClassification";

function ProjectFormModal({
  initialData,
  isEdit = false,
  onClose,
  onSubmit,
}) {
  const createInitialForm = () => {
    const data = {
      ...EMPTY_FORM,
      sdgTags: [],
      tags: [],
      photos: [],
      ...initialData,
    };

    if (
      (!data.sdgTags || data.sdgTags.length === 0) &&
      data.sdgTag
    ) {
      data.sdgTags = [data.sdgTag];
    }

    return data;
  };

  const [form, setForm] = useState(createInitialForm);
  const [saving, setSaving] = useState(false);
  const [qualityReport, setQualityReport] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);

  const {
    result,
    loading: classifying,
    error: classificationError,
    sourceFile,
    setTitle,
    setDescription,
    handleClassifyText,
    handleClassifyFile,
    resetClassification,
  } = useAIClassification();

  useEffect(() => {
    setForm(createInitialForm());
    setDocumentFile(null);
    setQualityReport(null);
    resetClassification?.();
  }, [initialData]);

  const handleChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
    setQualityReport(null);
  };

  const handleSDGChange = (sdg) => {
    setForm((previous) => {
      const current = previous.sdgTags || [];
      const updated = current.includes(sdg)
        ? current.filter((item) => item !== sdg)
        : [...current, sdg];

      return {
        ...previous,
        sdgTags: updated,
        sdgTag: updated.includes(previous.sdgTag)
          ? previous.sdgTag
          : updated[0] || "",
      };
    });

    setQualityReport(null);
  };

  const handlePrimarySDGChange = (sdg) => {
    setForm((previous) => {
      const current = previous.sdgTags || [];

      return {
        ...previous,
        sdgTag: sdg,
        sdgTags: current.includes(sdg)
          ? current
          : [sdg, ...current],
      };
    });

    setQualityReport(null);
  };

  const handleTagsChange = (event) => {
    const tags = event.target.value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    handleChange("tags", [...new Set(tags)]);
  };

  const handlePhotoChange = (event) => {
    const files = Array.from(event.target.files || []);
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const validFiles = files.filter((file) => {
      if (!validTypes.includes(file.type)) {
        alert(`${file.name} is not a supported image type.`);
        return false;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} exceeds the 10 MB size limit.`);
        return false;
      }

      return true;
    });

    setForm((previous) => ({
      ...previous,
      photos: [...(previous.photos || []), ...validFiles],
    }));

    setQualityReport(null);
    event.target.value = "";
  };

  const removePhoto = (index) => {
    setForm((previous) => {
      const photos = [...(previous.photos || [])];
      photos.splice(index, 1);

      return {
        ...previous,
        photos,
      };
    });

    setQualityReport(null);
  };

  const handleRunClassification = async () => {
    if (
      !form.title?.trim() &&
      !form.description?.trim()
    ) {
      alert("Enter a project title or description first.");
      return;
    }

    setTitle(form.title || "");
    setDescription(form.description || "");
    setQualityReport(null);

    try {
      await handleClassifyText(
        form.title || "",
        form.description || ""
      );
    } catch (error) {
      console.error("Text classification failed:", error);
    }
  };

  const handleDocumentClassification = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const extension = file.name
      .split(".")
      .pop()
      .toLowerCase();

    if (!["pdf", "txt"].includes(extension)) {
      alert("Please select a PDF or TXT document.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("The document must not exceed 10 MB.");
      event.target.value = "";
      return;
    }

    setDocumentFile(file);
    setQualityReport(null);

    try {
      const classificationResult =
        await handleClassifyFile(file);

      if (classificationResult !== false) {
        setForm((previous) => ({
          ...previous,
          document: file,
          title:
            previous.title?.trim() ||
            file.name.replace(/\.[^.]+$/, ""),
        }));
      }
    } catch (error) {
      console.error("Document classification failed:", error);
      alert("Unable to analyze this document. Please try again.");
    } finally {
      event.target.value = "";
    }
  };

  const removeDocument = () => {
    setDocumentFile(null);

    setForm((previous) => ({
      ...previous,
      document: null,
    }));

    resetClassification?.();
    setQualityReport(null);
  };

  useEffect(() => {
    if (!result) return;

    const normalizeSDG = (value) => {
      const text = String(value ?? "").trim();
      const match = text.match(/^SDG\s*(\d{1,2})$/i);

      if (match) {
        const number = Number(match[1]);

        if (number >= 1 && number <= 17) {
          return `SDG ${number}`;
        }
      }

      return SDG_OPTIONS.includes(text) ? text : "";
    };

    const primarySDG = normalizeSDG(
      result.sdgTag ??
        result.tag ??
        result.primarySDG ??
        ""
    );

    const rawSDGs = Array.isArray(result.sdgTags)
      ? result.sdgTags
      : Array.isArray(result.detectedSDGs)
        ? result.detectedSDGs
        : primarySDG
          ? [primarySDG]
          : [];

    const detectedSDGs = rawSDGs
      .map(normalizeSDG)
      .filter((sdg) => SDG_OPTIONS.includes(sdg));

    const rawTags = result.automaticTags || result.tags || [];

    const suggestedTags = (
      Array.isArray(rawTags) ? rawTags : []
    )
      .map((tag) =>
        typeof tag === "string"
          ? tag.trim()
          : String(tag?.tag || tag?.name || "").trim()
      )
      .filter(Boolean);

    const validPrimary = SDG_OPTIONS.includes(primarySDG)
      ? primarySDG
      : "";

    const validSDGs = [
      ...new Set([
        ...(validPrimary ? [validPrimary] : []),
        ...detectedSDGs,
      ]),
    ];

    setForm((previous) => {
      const mergedSDGs = [
        ...new Set([
          ...(previous.sdgTags || []),
          ...validSDGs,
        ]),
      ];

      const mergedTags = [
        ...new Set([
          ...(previous.tags || []),
          ...suggestedTags,
        ]),
      ];

      const nextPrimary =
        validPrimary ||
        previous.sdgTag ||
        mergedSDGs[0] ||
        "";

      return {
        ...previous,
        sdgTag: nextPrimary,
        sdgTags: mergedSDGs,
        tags: mergedTags,
      };
    });

    setQualityReport(null);
  }, [result]);

  const handleQualityCheck = () => {
    const selectedSDGs = form.sdgTags || [];
    const validStatus = STATUS_OPTIONS.includes(form.status);

    const checks = [
      {
        id: "title",
        label: "Project title",
        passed: (form.title || "").trim().length >= 5,
        severity: "error",
        message:
          (form.title || "").trim().length >= 5
            ? "A project title has been provided."
            : "Enter a descriptive title of at least 5 characters.",
      },
      {
        id: "description",
        label: "Project description",
        passed: (form.description || "").trim().length >= 30,
        severity: (form.description || "").trim()
          ? "warning"
          : "error",
        message:
          (form.description || "").trim().length >= 30
            ? "The description contains enough detail for an initial review."
            : (form.description || "").trim()
              ? "Consider adding more detail about the purpose, activities, and beneficiaries."
              : "Enter a project description.",
      },
      {
        id: "primarySDG",
        label: "Primary SDG",
        passed:
          Boolean(form.sdgTag) &&
          selectedSDGs.includes(form.sdgTag),
        severity: "error",
        message:
          form.sdgTag && selectedSDGs.includes(form.sdgTag)
            ? "The primary SDG is included in the selected SDGs."
            : "Choose a primary SDG and include it in the selected SDGs.",
      },
      {
        id: "sdgs",
        label: "SDG tags",
        passed: selectedSDGs.length > 0,
        severity: "error",
        message: selectedSDGs.length
          ? `${selectedSDGs.length} SDG(s) selected. Review their relevance.`
          : "Select at least one SDG.",
      },
      {
        id: "barangay",
        label: "Barangay or community",
        passed: Boolean((form.barangay || "").trim()),
        severity: "error",
        message: (form.barangay || "").trim()
          ? "The project location has been provided."
          : "Enter the barangay or community.",
      },
      {
        id: "status",
        label: "Project status",
        passed: validStatus,
        severity: "error",
        message: validStatus
          ? "A valid project status is selected."
          : "Select a valid project status.",
      },
      {
        id: "tags",
        label: "Project keywords",
        passed: (form.tags || []).length > 0,
        severity: "warning",
        message: (form.tags || []).length
          ? `${form.tags.length} project keyword(s) added.`
          : "Consider adding relevant project keywords.",
      },
      {
        id: "document",
        label: "Project document",
        passed: Boolean(
          documentFile ||
            form.document?.path ||
            form.document?.url ||
            form.document?.name
        ),
        severity: "warning",
        message:
          documentFile ||
          form.document?.path ||
          form.document?.url ||
          form.document?.name
            ? "A project document is available."
            : "No project document is attached. Upload one if required.",
      },
    ];

    const passedCount = checks.filter(
      (check) => check.passed
    ).length;

    const failedChecks = checks.filter(
      (check) => !check.passed
    );

    const errorCount = failedChecks.filter(
      (check) => check.severity === "error"
    ).length;

    const warningCount = failedChecks.filter(
      (check) => check.severity === "warning"
    ).length;

    setQualityReport({
      checks,
      totalChecks: checks.length,
      passedCount,
      errorCount,
      warningCount,
      hasErrors: errorCount > 0,
      isComplete: failedChecks.length === 0,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title?.trim()) {
      alert("Enter a project title.");
      return;
    }

    if (!form.description?.trim()) {
      alert("Enter a project description.");
      return;
    }

    if (!form.barangay?.trim()) {
      alert("Enter the barangay or community.");
      return;
    }

    if (!form.sdgTags || form.sdgTags.length === 0) {
      alert("Select at least one SDG.");
      return;
    }

    if (
      !form.sdgTag ||
      !form.sdgTags.includes(form.sdgTag)
    ) {
      alert("Select a primary SDG included in your SDG tags.");
      return;
    }

    setSaving(true);

    try {
      await onSubmit({
        ...form,
        title: (form.title || "").trim(),
        description: (form.description || "").trim(),
        barangay: (form.barangay || "").trim(),
        sdgTags: form.sdgTags || [],
        tags: form.tags || [],
        photos: form.photos || [],
        document: documentFile || form.document || null,
      });
    } catch (error) {
      alert(error.message || "Unable to save the project.");
    } finally {
      setSaving(false);
    }
  };

  const selectedSDGs = form.sdgTags || [];
  const photos = form.photos || [];

  const documentName =
    documentFile?.name ||
    form.document?.originalName ||
    form.document?.filename ||
    form.document?.name ||
    "";

  if (typeof document === "undefined") return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
      >
        <header className={styles.modalHeader}>
          <div className={styles.headerAccent} />

          <div className={styles.headerContent}>
            <div className={styles.headerIcon}>✦</div>

            <div className={styles.headerText}>
              <p className={styles.eyebrow}>SDG SMART HUB / PROJECTS</p>

              <h2
                id="project-modal-title"
                className={styles.modalTitle}
              >
                {isEdit ? "Edit project" : "Create a project"}
              </h2>

              <p className={styles.headerDescription}>
                {isEdit
                  ? "Update the details and classification of this project."
                  : "Add a community initiative and connect it with the Sustainable Development Goals."}
              </p>
            </div>
          </div>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close project form"
            disabled={saving}
          >
            ×
          </button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          {!isEdit && (
            <section
              className={`${styles.sectionCard} ${styles.aiCard}`}
            >
              <div className={styles.sectionHeading}>
                <div className={styles.sectionIcon}>✧</div>
                <div>
                  <h3>AI classification assistant</h3>
                  <p>
                    Get suggested SDGs and keywords from your project
                    details or a supporting PDF/TXT document.
                  </p>
                </div>
              </div>

              <div className={styles.aiActions}>
                <button
                  type="button"
                  onClick={handleRunClassification}
                  disabled={classifying}
                  className={styles.primaryBtn}
                >
                  {classifying ? "Analyzing..." : "✦ Suggest SDGs"}
                </button>

                <label
                  className={`${styles.secondaryBtn} ${
                    classifying ? styles.disabledLabel : ""
                  }`}
                >
                  {classifying ? "Please wait..." : "Upload PDF / TXT"}
                  <input
                    type="file"
                    accept=".pdf,.txt,application/pdf,text/plain"
                    onChange={handleDocumentClassification}
                    disabled={classifying}
                    hidden
                  />
                </label>
              </div>

              {classifying && (
                <div className={styles.loadingMessage}>
                  <span className={styles.spinner} />
                  Analyzing project information...
                </div>
              )}

              {classificationError && (
                <p className={styles.errorMessage} role="alert">
                  {classificationError}
                </p>
              )}

              {result && !classifying && (
                <p className={styles.successMessage} role="status">
                  ✓ Analysis complete. Review the suggestions before saving.
                </p>
              )}

              {sourceFile && (
                <p className={styles.helperText}>
                  Analyzed file: <strong>{sourceFile.name}</strong>
                </p>
              )}

              {documentName && (
                <div className={styles.documentItem}>
                  <span className={styles.documentIcon}>DOC</span>
                  <div className={styles.documentDetails}>
                    <strong>{documentName}</strong>
                    <span>Project document</span>
                  </div>
                  {documentFile && (
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={removeDocument}
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </section>
          )}

          <section className={styles.sectionCard}>
            <div className={styles.sectionHeading}>
              <div className={styles.sectionNumber}>01</div>
              <div>
                <h3>Basic information</h3>
                <p>Start with a clear name and project description.</p>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="project-title">
                Project title <span className={styles.required}>*</span>
              </label>
              <input
                id="project-title"
                className={styles.input}
                value={form.title || ""}
                onChange={(event) =>
                  handleChange("title", event.target.value)
                }
                placeholder="Enter a descriptive project title"
                required
                maxLength={200}
              />
              <span className={styles.characterCount}>
                {(form.title || "").length}/200 characters
              </span>
            </div>

            <div className={styles.field}>
              <label
                className={styles.label}
                htmlFor="project-description"
              >
                Project description{" "}
                <span className={styles.required}>*</span>
              </label>
              <textarea
                id="project-description"
                className={styles.textarea}
                rows={4}
                value={form.description || ""}
                onChange={(event) =>
                  handleChange("description", event.target.value)
                }
                placeholder="Describe the purpose, activities, and beneficiaries..."
                required
                maxLength={10000}
              />
              <span className={styles.characterCount}>
                {(form.description || "").length}/10,000 characters
              </span>
            </div>
          </section>

          <section className={styles.sectionCard}>
            <div className={styles.sectionHeading}>
              <div className={styles.sectionNumber}>02</div>
              <div>
                <h3>SDG classification</h3>
                <p>
                  Select all relevant goals, then choose the primary SDG.
                </p>
              </div>
            </div>

            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label className={styles.label}>
                  Relevant SDGs <span className={styles.required}>*</span>
                </label>
                <span className={styles.selectionCount}>
                  {selectedSDGs.length} selected
                </span>
              </div>

              <div className={styles.sdgGrid}>
                {SDG_OPTIONS.map((sdg, index) => {
                  const selected = selectedSDGs.includes(sdg);

                  return (
                    <label
                      key={sdg}
                      className={`${styles.sdgOption} ${
                        selected ? styles.sdgSelected : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => handleSDGChange(sdg)}
                      />
                      <span className={styles.sdgNumber}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className={styles.sdgName}>{sdg}</span>
                      {selected && (
                        <span className={styles.sdgCheck}>✓</span>
                      )}
                    </label>
                  );
                })}
              </div>

              <p className={styles.helperText}>
                AI recommendations are suggestions. Confirm that each
                selected goal genuinely relates to the project.
              </p>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="primary-sdg">
                  Primary SDG <span className={styles.required}>*</span>
                </label>
                <select
                  id="primary-sdg"
                  className={styles.select2}
                  value={form.sdgTag || ""}
                  onChange={(event) =>
                    handlePrimarySDGChange(event.target.value)
                  }
                  required
                >
                  <option value="" disabled>
                    Select primary SDG
                  </option>
                  {SDG_OPTIONS.map((sdg) => (
                    <option key={sdg} value={sdg}>
                      {sdg}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="project-status">
                  Project status
                </label>
                <select
                  id="project-status"
                  className={styles.select2}
                  value={form.status || "Planned"}
                  onChange={(event) =>
                    handleChange("status", event.target.value)
                  }
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className={styles.sectionCard}>
            <div className={styles.sectionHeading}>
              <div className={styles.sectionNumber}>03</div>
              <div>
                <h3>Location and keywords</h3>
                <p>Help people find and understand the initiative.</p>
              </div>
            </div>

            <div className={styles.field}>
              <label
                className={styles.label}
                htmlFor="project-barangay"
              >
                Barangay or community{" "}
                <span className={styles.required}>*</span>
              </label>
              <input
                id="project-barangay"
                className={styles.input}
                value={form.barangay || ""}
                onChange={(event) =>
                  handleChange("barangay", event.target.value)
                }
                placeholder="Enter barangay or community"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="project-tags">
                Project keywords
              </label>
              <input
                id="project-tags"
                className={styles.input}
                value={(form.tags || []).join(", ")}
                onChange={handleTagsChange}
                placeholder="Livelihood, training, community"
              />
              <p className={styles.helperText}>
                Separate keywords with commas. You can edit AI suggestions.
              </p>
            </div>
          </section>

          <section className={styles.sectionCard}>
            <div className={styles.sectionHeading}>
              <div className={styles.sectionNumber}>04</div>
              <div>
                <h3>Project attachments</h3>
                <p>Attach photos and supporting project documents.</p>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Project photos</label>

              <label className={styles.uploadBox}>
                <span className={styles.uploadIcon}>＋</span>
                <span>
                  <strong>Add project photos</strong>
                  <small>JPG, PNG, or WebP · Max 10 MB each</small>
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handlePhotoChange}
                  hidden
                />
              </label>

              {photos.length > 0 && (
                <div className={styles.photoList}>
                  {photos.map((photo, index) => {
                    const name =
                      typeof File !== "undefined" &&
                      photo instanceof File
                        ? photo.name
                        : typeof photo === "string"
                          ? photo.split("/").pop()
                          : photo?.originalName ||
                            photo?.name ||
                            `Photo ${index + 1}`;

                    return (
                      <div
                        key={`${name}-${index}`}
                        className={styles.photoItem}
                      >
                        <span className={styles.photoIcon}>IMG</span>
                        <span className={styles.photoName}>{name}</span>
                        <button
                          type="button"
                          className={styles.removeBtn}
                          onClick={() => removePhoto(index)}
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {documentName && (
                <div className={styles.attachmentSummary}>
                  <span>Attached document</span>
                  <strong>{documentName}</strong>
                  <small>
                    {documentFile
                      ? "New document — will be submitted with the project"
                      : "Existing document"}
                  </small>
                </div>
              )}
            </div>
          </section>

          <section
            className={`${styles.sectionCard} ${styles.qualityCard}`}
          >
            <div className={styles.sectionHeading}>
              <div className={styles.sectionNumber}>✓</div>
              <div>
                <h3>Project quality check</h3>
                <p>Review the completeness of the information before saving.</p>
              </div>
            </div>

            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={handleQualityCheck}
            >
              Run quality check
            </button>

            {qualityReport && (
              <div
                className={styles.qualityResults}
                aria-live="polite"
              >
                <div className={styles.qualitySummary}>
                  <strong>
                    {qualityReport.passedCount} of{" "}
                    {qualityReport.totalChecks} checks passed
                  </strong>
                  <span>
                    {qualityReport.hasErrors
                      ? "Action required"
                      : qualityReport.warningCount > 0
                        ? "Review suggestions"
                        : "All checks passed"}
                  </span>
                </div>

                {qualityReport.checks.map((check) => (
                  <div
                    key={check.id}
                    className={styles.qualityItem}
                  >
                    <span
                      className={
                        check.passed
                          ? styles.qualityPass
                          : check.severity === "warning"
                            ? styles.qualityWarning
                            : styles.qualityError
                      }
                    >
                      {check.passed
                        ? "✓"
                        : check.severity === "warning"
                          ? "!"
                          : "×"}
                    </span>
                    <div>
                      <strong>{check.label}</strong>
                      <p>{check.message}</p>
                    </div>
                  </div>
                ))}

                <p
                  className={
                    qualityReport.hasErrors
                      ? styles.errorMessage
                      : styles.qualityNote
                  }
                >
                  {qualityReport.hasErrors
                    ? "Some required information needs attention."
                    : qualityReport.warningCount > 0
                      ? "No required issues found. Consider reviewing the warnings."
                      : "All completeness checks passed."}
                </p>
              </div>
            )}
          </section>

          <footer className={styles.modalFooter}>
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
              className={styles.primaryBtn}
              disabled={saving}
            >
              {saving
                ? "Saving project..."
                : isEdit
                  ? "Save changes"
                  : "Save project"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

export default ProjectFormModal;