
import { useEffect, useState } from "react";
import styles from "./Form.module.css";
import {
  SDG_OPTIONS,
  STATUS_OPTIONS,
  EMPTY_PROJECT,
} from "./Constants.js";
import { classifyText } from "../AIClassifier/aiClassifierService";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

const getPhotoUrl = (photo) => {
  if (!photo || typeof photo !== "string") return "";
  if (/^https?:\/\//i.test(photo)) return photo;
  return `${API_BASE_URL}${photo.startsWith("/") ? "" : "/"}${photo}`;
};

const getDocumentName = (document) => {
  if (!document) return "";
  if (typeof document === "string") {
    return document.split("/").pop().split("?")[0];
  }

  return (
    document.originalName ||
    document.filename ||
    document.name ||
    document.path?.split("/").pop() ||
    "Project document"
  );
};

function ProjectForm({ initialData, onClose, onSubmit }) {
  const [form, setForm] = useState(initialData || EMPTY_PROJECT);
  const [saving, setSaving] = useState(false);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [documentFile, setDocumentFile] = useState(null);
  const [existingDocument, setExistingDocument] = useState(null);
  const [removeExistingDocument, setRemoveExistingDocument] = useState(false);
  const [documentError, setDocumentError] = useState("");
  const [classifying, setClassifying] = useState(false);
  const [classificationError, setClassificationError] = useState("");
  const [classificationResult, setClassificationResult] = useState(null);

  const isEditing = Boolean(initialData?._id);

  useEffect(() => {
    const data = initialData || EMPTY_PROJECT;
    const existingPhotos = Array.isArray(data.photos)
      ? data.photos.filter((photo) => typeof photo === "string")
      : [];

    setForm({ ...data, photos: existingPhotos });
    setPhotoPreviews(
      existingPhotos.map((photo) => ({
        source: photo,
        preview: getPhotoUrl(photo),
        existing: true,
      }))
    );
    setDocumentFile(null);
    setExistingDocument(data.document || null);
    setRemoveExistingDocument(false);
    setDocumentError("");
    setClassificationError("");
    setClassificationResult(null);
  }, [initialData]);

  useEffect(() => {
    return () => {
      photoPreviews.forEach((photo) => {
        if (!photo.existing && photo.preview) {
          URL.revokeObjectURL(photo.preview);
        }
      });
    };
  }, [photoPreviews]);

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const availableSlots = Math.max(0, 10 - photoPreviews.length);
    const selectedFiles = files
      .filter((file) =>
        ["image/jpeg", "image/png", "image/webp"].includes(file.type)
      )
      .slice(0, availableSlots);

    if (!selectedFiles.length) {
      e.target.value = "";
      return;
    }

    const newPhotos = selectedFiles.map((file) => ({
      source: file,
      preview: URL.createObjectURL(file),
      existing: false,
    }));

    setPhotoPreviews((current) => [...current, ...newPhotos]);
    setForm((current) => ({
      ...current,
      photos: [
        ...(Array.isArray(current.photos) ? current.photos : []),
        ...selectedFiles,
      ],
    }));

    e.target.value = "";
  };

  const removePhoto = (index) => {
    const photo = photoPreviews[index];
    if (!photo) return;

    if (!photo.existing && photo.preview) {
      URL.revokeObjectURL(photo.preview);
    }

    setPhotoPreviews((current) =>
      current.filter((_, photoIndex) => photoIndex !== index)
    );

    setForm((current) => {
      const photos = Array.isArray(current.photos) ? [...current.photos] : [];

      if (photo.existing) {
        const existingIndex = photos.findIndex(
          (item) => typeof item === "string" && item === photo.source
        );
        if (existingIndex !== -1) photos.splice(existingIndex, 1);
      } else {
        const fileIndex = photos.indexOf(photo.source);
        if (fileIndex !== -1) photos.splice(fileIndex, 1);
      }

      return { ...current, photos };
    });
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop().toLowerCase();
    const validExtension = ["pdf", "txt"].includes(extension);
    const validType = ["application/pdf", "text/plain"].includes(file.type);

    if (!validExtension || !validType) {
      setDocumentError("Please select a PDF or TXT document.");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setDocumentError("The document must be 10 MB or smaller.");
      e.target.value = "";
      return;
    }

    setDocumentFile(file);
    setExistingDocument(null);
    setRemoveExistingDocument(true);
    setDocumentError("");
    e.target.value = "";
  };

  const removeDocument = () => {
    setDocumentFile(null);
    setExistingDocument(null);
    setRemoveExistingDocument(true);
    setDocumentError("");
  };

  const handleAIClassify = async () => {
    const title = String(form.title || "").trim();
    const description = String(form.description || "").trim();

    console.log("[ProjectForm] Title:", title);
    console.log("[ProjectForm] Description:", description);

    if (!title && !description) {
      setClassificationError(
        "Enter a project title or description before classifying."
      );
      setClassificationResult(null);
      return;
    }

    setClassifying(true);
    setClassificationError("");
    setClassificationResult(null);

    try {
      const response = await classifyText(title, description);

      console.log("[ProjectForm] AI response:", response);

      const result = response?.data ?? response;
      const suggestedSDG =
        result?.sdgTag ?? result?.tag ?? result?.sdg ?? "";

      const normalizedSuggestion = String(suggestedSDG)
        .trim()
        .toLowerCase();

      const matchingSDG = SDG_OPTIONS.find((option) => {
        const normalizedOption = String(option).trim().toLowerCase();

        return (
          normalizedOption === normalizedSuggestion ||
          (normalizedSuggestion &&
            normalizedOption.startsWith(`${normalizedSuggestion} -`))
        );
      });

      if (matchingSDG) {
        handleChange("sdgTag", matchingSDG);
      }

      const rawTags = Array.isArray(result?.automaticTags)
        ? result.automaticTags
        : Array.isArray(result?.tags)
        ? result.tags
        : [];

      const automaticTags = rawTags
        .map((tag) =>
          typeof tag === "string"
            ? tag
            : tag?.tag || tag?.name || ""
        )
        .filter(Boolean);

      setClassificationResult({
        suggestedSDG: matchingSDG || suggestedSDG,
        automaticTags,
        relatedSDGs: Array.isArray(result?.relatedSDGs)
          ? result.relatedSDGs
          : [],
      });

      if (!matchingSDG && suggestedSDG) {
        setClassificationError(
          `The AI suggested "${suggestedSDG}", but it does not exactly match an available SDG option. Please select the goal manually.`
        );
      } else if (!suggestedSDG) {
        setClassificationError(
          "The classifier did not return an SDG suggestion. Please select a goal manually."
        );
      }
    } catch (error) {
      console.error("[ProjectForm] AI classification failed:", error);

      setClassificationError(
        error.message || "Classification failed. Please try again."
      );
    } finally {
      setClassifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await onSubmit({
        ...form,
        document: documentFile,
        removeDocument: removeExistingDocument,
      });
    } catch (error) {
      console.error("Failed to save project:", error);
      window.alert(
        "Unable to save the project. Please check the server and try again."
      );
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
            <span>▤</span>
          </div>
          <div className={styles.headerText}>
            <span className={styles.eyebrow}>PROJECT MANAGEMENT</span>
            <h2 className={styles.formTitle}>
              {isEditing ? "Edit Project" : "Add Project"}
            </h2>
            <p className={styles.formSubtitle}>
              {isEditing
                ? "Update project details, documents, and photos."
                : "Create a project and connect it with the Sustainable Development Goals."}
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
                <h3 className={styles.sectionTitle}>Project Information</h3>
                <p className={styles.sectionDescription}>
                  Provide the basic details of the project.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="project-title">
              Project Title <span className={styles.required}>*</span>
            </label>
            <input
              id="project-title"
              className={styles.input}
              value={form.title || ""}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Enter project title"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="project-description">
              Description <span className={styles.required}>*</span>
            </label>
            <textarea
              id="project-description"
              className={styles.textarea}
              rows={4}
              value={form.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe the project's purpose, activities, and expected results"
              required
            />
          </div>

          <div className={styles.aiSection}>
            <div className={styles.aiHeading}>
              <span className={styles.aiSparkle}>✦</span>
              <div>
                <h4 className={styles.aiTitle}>AI SDG Classification</h4>
                <p className={styles.aiHint}>
                  Analyze the project details and suggest a relevant SDG.
                </p>
              </div>
            </div>

            <button
              type="button"
              className={styles.aiButton}
              onClick={handleAIClassify}
              disabled={classifying || saving}
            >
              {classifying ? "Analyzing Project..." : "✦ Classify with AI"}
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
                  Suggested SDG:{" "}
                  <strong>
                    {classificationResult.suggestedSDG || "No SDG detected"}
                  </strong>
                </p>

                {classificationResult.automaticTags.length > 0 && (
                  <div className={styles.aiTags}>
                    <span className={styles.aiTagsLabel}>Suggested Tags</span>
                    {classificationResult.automaticTags.map((tag, index) => (
                      <span className={styles.aiTag} key={`${tag}-${index}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {classificationResult.relatedSDGs.length > 0 && (
                  <div className={styles.aiTags}>
                    <span className={styles.aiTagsLabel}>Related SDGs</span>
                    {classificationResult.relatedSDGs.map((sdg, index) => {
                      const label =
                        typeof sdg === "string"
                          ? sdg
                          : sdg?.tag || sdg?.sdgTag || sdg?.name || "";

                      return label ? (
                        <span
                          className={styles.aiTag}
                          key={`${label}-${index}`}
                        >
                          {label}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles.twoColumn}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="project-sdg">
                SDG Goal <span className={styles.required}>*</span>
              </label>
              <select
                id="project-sdg"
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
              <label className={styles.label} htmlFor="project-status">
                Status <span className={styles.required}>*</span>
              </label>
              <select
                id="project-status"
                className={styles.select}
                value={form.status || ""}
                onChange={(e) => handleChange("status", e.target.value)}
                required
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="project-barangay">
              Barangay <span className={styles.required}>*</span>
            </label>
            <input
              id="project-barangay"
              className={styles.input}
              value={form.barangay || ""}
              onChange={(e) => handleChange("barangay", e.target.value)}
              placeholder="Enter barangay"
              required
            />
          </div>
        </section>

        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>02</span>
              <div>
                <h3 className={styles.sectionTitle}>Project Document</h3>
                <p className={styles.sectionDescription}>
                  Upload the project proposal or supporting documentation.
                </p>
              </div>
            </div>
            <span className={styles.optionalBadge}>Optional</span>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="project-document">
              Upload PDF or TXT
            </label>
            <input
              id="project-document"
              className={styles.input}
              type="file"
              accept=".pdf,.txt,application/pdf,text/plain"
              onChange={handleDocumentChange}
              disabled={saving}
            />

            <p className={styles.helperText}>
              Accepted formats: PDF and TXT. Maximum file size: 10 MB.
            </p>

            {documentError && (
              <p className={styles.aiError} role="alert">
                {documentError}
              </p>
            )}

            {(documentFile || existingDocument) && (
              <div className={styles.documentItem}>
                <div className={styles.documentIcon}>↥</div>
                <div className={styles.documentDetails}>
                  <span className={styles.documentName}>
                    {documentFile
                      ? documentFile.name
                      : getDocumentName(existingDocument)}
                  </span>
                  <span className={styles.documentMeta}>
                    {documentFile ? "New document selected" : "Existing document"}
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={removeDocument}
                  disabled={saving}
                  aria-label="Remove project document"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </section>

        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>03</span>
              <div>
                <h3 className={styles.sectionTitle}>Project Photos</h3>
                <p className={styles.sectionDescription}>
                  Add photos showing project activities, events, or results.
                </p>
              </div>
            </div>
            <span className={styles.photoCount}>
              {photoPreviews.length} / 10
            </span>
          </div>

          <div className={styles.photoUploadArea}>
            <label
              className={`${styles.addPhotoCard} ${
                photoPreviews.length >= 10 ? styles.disabledUpload : ""
              }`}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handlePhotoChange}
                disabled={photoPreviews.length >= 10 || saving}
              />
              <span className={styles.uploadIcon}>+</span>
              <span className={styles.uploadTitle}>Add Photos</span>
              <span className={styles.uploadText}>JPG, PNG or WebP</span>
            </label>

            {photoPreviews.map((photo, index) => (
              <div
                key={`${photo.preview}-${index}`}
                className={styles.photoPreview}
              >
                {photo.preview && (
                  <img
                    src={photo.preview}
                    alt={`Project photo ${index + 1}`}
                  />
                )}
                <button
                  type="button"
                  className={styles.removePhoto}
                  onClick={() => removePhoto(index)}
                  disabled={saving}
                  aria-label={`Remove photo ${index + 1}`}
                >
                  ×
                </button>
                {photo.existing && (
                  <span className={styles.existingBadge}>Saved</span>
                )}
              </div>
            ))}
          </div>

          <p className={styles.helperText}>
            Upload up to 10 photos. Supported formats are JPG, PNG, and WebP.
          </p>
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
          {saving ? "Saving..." : isEditing ? "Save Changes" : "Save Project"}
        </button>
      </div>
    </form>
  );
}

export default ProjectForm;
