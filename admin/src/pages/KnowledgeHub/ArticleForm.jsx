
import { useEffect, useState } from "react";
import styles from "./ArticleForm.module.css";
import { SDG_OPTIONS, CATEGORIES, EMPTY_ARTICLE } from "./articleConstants";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://sdg-smarthub-api.onrender.com/api";

const RESOURCE_TYPES = [
  { value: "uploaded", label: "Uploaded File" },
  { value: "youtube", label: "YouTube Video" },
  { value: "shorts", label: "YouTube Shorts" },
  { value: "article", label: "External Article" },
];

function ArticleForm({ initialData, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    ...EMPTY_ARTICLE,
    ...(initialData || {}),
  });

  const [hasSdgTag, setHasSdgTag] = useState(
    Boolean(initialData?.sdgTag)
  );
  const [saving, setSaving] = useState(false);
  const [fetchingMetadata, setFetchingMetadata] = useState(false);
  const [metadataMessage, setMetadataMessage] = useState("");
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [documentFile, setDocumentFile] = useState(null);
  const [existingDocument, setExistingDocument] = useState(
    initialData?.document || null
  );

  useEffect(() => {
    const data = {
      ...EMPTY_ARTICLE,
      ...(initialData || {}),
    };

    setForm(data);
    setHasSdgTag(Boolean(data.sdgTag));
    setExistingDocument(data.document || null);
    setDocumentFile(null);

    const existingPhotos = (data.photos || []).map((photo) => ({
      preview: photo,
      file: null,
      existing: true,
    }));

    setPhotoPreviews(existingPhotos);
  }, [initialData]);

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleResourceTypeChange = (value) => {
    setForm((previous) => ({
      ...previous,
      resourceType: value,
      sourceUrl: "",
      embedUrl: "",
      thumbnailUrl: "",
    }));

    setMetadataMessage("");
  };

  const fetchMetadata = async () => {
    const url = form.sourceUrl?.trim();

    if (!url) {
      setMetadataMessage("Please enter a resource URL first.");
      return;
    }

    try {
      setFetchingMetadata(true);
      setMetadataMessage("");

      const response = await fetch(
        `${API_BASE}/knowledge/metadata/preview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url,
            resourceType: form.resourceType,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to fetch resource information."
        );
      }

      const metadata = result.data || result;

      setForm((previous) => ({
        ...previous,
        title: metadata.title || previous.title,
        summary: metadata.description || metadata.summary || previous.summary,
        embedUrl: metadata.embedUrl || previous.embedUrl,
        thumbnailUrl: metadata.thumbnailUrl || previous.thumbnailUrl,
        sourceUrl: url,
      }));

      setMetadataMessage(
        "Resource information fetched. Review the details before saving."
      );
    } catch (error) {
      setMetadataMessage(
        error.message || "Unable to fetch resource information."
      );
    } finally {
      setFetchingMetadata(false);
    }
  };

  const handlePhotoChange = (event) => {
    const files = Array.from(event.target.files || []);

    const newPhotos = files.map((file) => ({
      preview: URL.createObjectURL(file),
      file,
      existing: false,
    }));

    setPhotoPreviews((previous) => [...previous, ...newPhotos]);
    event.target.value = "";
  };

  const removePhoto = (index) => {
    setPhotoPreviews((previous) => {
      const photo = previous[index];

      if (photo && !photo.existing) {
        URL.revokeObjectURL(photo.preview);
      }

      return previous.filter((_, photoIndex) => photoIndex !== index);
    });
  };

  const handleDocumentChange = (event) => {
    const file = event.target.files?.[0] || null;

    setDocumentFile(file);
    event.target.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (hasSdgTag && !form.sdgTag) {
      alert("Please select an SDG Goal.");
      return;
    }

    if (!hasSdgTag) {
      updateField("sdgTag", "");
    }

    if (
      form.resourceType !== "uploaded" &&
      !form.sourceUrl?.trim()
    ) {
      alert("Please enter the resource URL.");
      return;
    }

    if (!form.title?.trim()) {
      alert("Please enter a resource title.");
      return;
    }

    if (!form.category) {
      alert("Please select a category.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        sdgTag: hasSdgTag ? form.sdgTag : "",
        photos: photoPreviews.map((photo) =>
          photo.existing ? photo.preview : photo.file
        ).filter(Boolean),
        document: documentFile,
        existingDocument,
      };

      await onSubmit(payload);
    } catch (error) {
      console.error("Failed to save resource:", error);
      alert(error.message || "Failed to save resource.");
    } finally {
      setSaving(false);
    }
  };

  const isVideo =
    form.resourceType === "youtube" ||
    form.resourceType === "shorts";

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <section className={styles.formSection}>
        <div className={styles.sectionHeader}>
          <h3>Resource Information</h3>
          <p>Choose the type of learning material you want to add.</p>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Resource Type</label>
          <select
            className={styles.select2}
            value={form.resourceType || "uploaded"}
            onChange={(event) =>
              handleResourceTypeChange(event.target.value)
            }
          >
            {RESOURCE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {form.resourceType !== "uploaded" && (
          <div className={styles.linkBox}>
            <div className={styles.field}>
              <label className={styles.label}>Resource URL</label>
              <input
                className={styles.input}
                type="url"
                placeholder={
                  form.resourceType === "youtube"
                    ? "Paste YouTube video URL"
                    : form.resourceType === "shorts"
                    ? "Paste YouTube Shorts URL"
                    : "Paste article URL"
                }
                value={form.sourceUrl || ""}
                onChange={(event) =>
                  updateField("sourceUrl", event.target.value)
                }
                required
              />
            </div>

            <button
              type="button"
              className={styles.fetchBtn}
              onClick={fetchMetadata}
              disabled={fetchingMetadata}
            >
              {fetchingMetadata
                ? "Fetching..."
                : "Fetch Resource Preview"}
            </button>

            {metadataMessage && (
              <p className={styles.metadataMessage}>
                {metadataMessage}
              </p>
            )}

            {form.thumbnailUrl && (
              <div className={styles.previewBox}>
                <span className={styles.previewLabel}>
                  Resource Thumbnail
                </span>
                <img
                  className={styles.resourceThumbnail}
                  src={form.thumbnailUrl}
                  alt="Resource thumbnail"
                />
              </div>
            )}

            {isVideo && form.embedUrl && (
              <div className={styles.previewBox}>
                <span className={styles.previewLabel}>
                  Video Preview
                </span>
                <div
                  className={styles.videoPreview}
                  style={{
                    aspectRatio:
                      form.resourceType === "shorts" ? "9 / 16" : "16 / 9",
                    maxWidth:
                      form.resourceType === "shorts" ? "260px" : "100%",
                  }}
                >
                  <iframe
                    src={form.embedUrl}
                    title="Video preview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <section className={styles.formSection}>
        <div className={styles.sectionHeader}>
          <h3>Resource Details</h3>
          <p>Add the title and information that will appear in the Knowledge Hub.</p>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Resource Title</label>
          <input
            className={styles.input}
            type="text"
            placeholder="Enter resource title"
            value={form.title || ""}
            onChange={(event) =>
              updateField("title", event.target.value)
            }
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Short Description</label>
          <textarea
            className={styles.textarea}
            rows={3}
            placeholder="Write a short description of this resource"
            value={form.summary || ""}
            onChange={(event) =>
              updateField("summary", event.target.value)
            }
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Content / Additional Information</label>
          <textarea
            className={styles.textarea}
            rows={5}
            placeholder="Add additional information or learning notes"
            value={form.content || ""}
            onChange={(event) =>
              updateField("content", event.target.value)
            }
          />
        </div>
      </section>

      <section className={styles.formSection}>
        <div className={styles.sectionHeader}>
          <h3>SDG Classification</h3>
          <p>Choose whether this resource is connected to a specific SDG.</p>
        </div>

        <div className={styles.sdgToggleRow}>
          <div>
            <strong>Connect to an SDG Goal</strong>
            <p>
              Turn this off for general SDG learning materials.
            </p>
          </div>

          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={hasSdgTag}
              onChange={(event) => {
                const enabled = event.target.checked;

                setHasSdgTag(enabled);

                if (!enabled) {
                  updateField("sdgTag", "");
                } else if (!form.sdgTag) {
                  updateField("sdgTag", SDG_OPTIONS[0]);
                }
              }}
            />
            <span className={styles.slider}></span>
          </label>
        </div>

        {hasSdgTag ? (
          <div className={styles.field}>
            <label className={styles.label}>Select SDG Goal</label>
            <select
              className={styles.select2}
              value={form.sdgTag || SDG_OPTIONS[0]}
              onChange={(event) =>
                updateField("sdgTag", event.target.value)
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
        ) : (
          <div className={styles.generalGuideNotice}>
            <strong>General SDG Guide</strong>
            <p>
              This resource will be available as general SDG learning
              material without being assigned to an individual goal.
            </p>
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.label}>Category</label>
          <select
            className={styles.select2}
            value={form.category || CATEGORIES[0]}
            onChange={(event) =>
              updateField("category", event.target.value)
            }
            required
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </section>

      {form.resourceType === "uploaded" && (
        <section className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <h3>Attachments</h3>
            <p>Upload supporting images or a learning document.</p>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Resource Images</label>
            <input
              className={styles.fileInput}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              multiple
              onChange={handlePhotoChange}
            />

            {photoPreviews.length > 0 && (
              <div className={styles.photoPreviewGrid}>
                {photoPreviews.map((photo, index) => (
                  <div
                    className={styles.photoPreviewItem}
                    key={`${photo.preview}-${index}`}
                  >
                    <img src={photo.preview} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Document File</label>
            <input
              className={styles.fileInput}
              type="file"
              accept=".pdf,.txt,.docx"
              onChange={handleDocumentChange}
            />

            {documentFile && (
              <p className={styles.helperText}>
                Selected file: {documentFile.name}
              </p>
            )}

            {!documentFile && existingDocument?.originalName && (
              <p className={styles.helperText}>
                Existing document: {existingDocument.originalName}
              </p>
            )}
          </div>
        </section>
      )}

      <div className={styles.formActions}>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : initialData
            ? "Save Changes"
            : "Add Resource"}
        </button>
      </div>
    </form>
  );
}

export default ArticleForm;
