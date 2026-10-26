import { useEffect, useState } from "react";
import styles from "./ArticleForm.module.css";
import {
  SDG_OPTIONS,
  CATEGORIES,
  EMPTY_ARTICLE,
} from "./constants.js";

function ArticleForm({
  initialData,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(
    initialData || EMPTY_ARTICLE
  );

  const [saving, setSaving] = useState(false);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [documentFile, setDocumentFile] = useState(null);
  const [existingDocument, setExistingDocument] = useState(null);

  useEffect(() => {
    const data = initialData || EMPTY_ARTICLE;

    setForm({
      ...data,
      summary: data.summary || "",
      readTime: data.readTime || "5 min read",
      photos: Array.isArray(data.photos) ? data.photos : [],
    });

    setDocumentFile(null);
    setExistingDocument(data.document || null);

    setPhotoPreviews(
      (Array.isArray(data.photos) ? data.photos : []).map(
        (photo) => ({
          source: photo,
          preview: photo,
          existing: true,
        })
      )
    );
  }, [initialData]);

  const handlePhotoChange = (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    const availableSlots = Math.max(
      0,
      10 - photoPreviews.length
    );

    const selectedFiles = files.slice(0, availableSlots);

    const newPhotos = selectedFiles.map((file) => ({
      source: file,
      preview: URL.createObjectURL(file),
      existing: false,
    }));

    setPhotoPreviews((current) => [
      ...current,
      ...newPhotos,
    ]);

    setForm((current) => ({
      ...current,
      photos: [
        ...(current.photos || []),
        ...selectedFiles,
      ],
    }));

    event.target.value = "";
  };

  const removePhoto = (index) => {
    const photo = photoPreviews[index];

    if (!photo) return;

    if (!photo.existing && photo.preview) {
      URL.revokeObjectURL(photo.preview);
    }

    const updatedPreviews = photoPreviews.filter(
      (_, photoIndex) => photoIndex !== index
    );

    setPhotoPreviews(updatedPreviews);

    setForm((current) => {
      const existingPhotos = (current.photos || []).filter(
        (item) => typeof item === "string"
      );

      const filePhotos = (current.photos || []).filter(
        (item) => item instanceof File
      );

      if (photo.existing) {
        const existingIndex = photoPreviews
          .slice(0, index)
          .filter((item) => item.existing).length;

        existingPhotos.splice(existingIndex, 1);
      } else {
        const fileIndex = photoPreviews
          .slice(0, index)
          .filter((item) => !item.existing).length;

        filePhotos.splice(fileIndex, 1);
      }

      return {
        ...current,
        photos: [...existingPhotos, ...filePhotos],
      };
    });
  };

  const handleDocumentChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      setDocumentFile(file);
    }

    event.target.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      await onSubmit({
        ...form,
        document: documentFile,
        existingDocument,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
    >
      <div className={styles.field}>
        <label className={styles.label}>
          Title
        </label>

        <input
          className={styles.input}
          value={form.title || ""}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              title: event.target.value,
            }))
          }
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Summary
        </label>

        <textarea
          className={styles.textarea}
          rows={3}
          value={form.summary || ""}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              summary: event.target.value,
            }))
          }
          required
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>
            SDG Tag
          </label>

          <select
            className={styles.select2}
            value={form.sdgTag || SDG_OPTIONS[0]}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                sdgTag: event.target.value,
              }))
            }
          >
            {SDG_OPTIONS.map((sdg) => (
              <option key={sdg} value={sdg}>
                {sdg}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            Category
          </label>

          <select
            className={styles.select2}
            value={form.category || CATEGORIES[0]}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                category: event.target.value,
              }))
            }
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Read Time
        </label>

        <input
          className={styles.input}
          value={form.readTime || ""}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              readTime: event.target.value,
            }))
          }
          placeholder="5 min read"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Content
        </label>

        <textarea
          className={styles.textarea}
          rows={6}
          value={form.content || ""}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              content: event.target.value,
            }))
          }
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Photos
        </label>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handlePhotoChange}
          disabled={photoPreviews.length >= 10}
        />

        {photoPreviews.length > 0 && (
          <div className={styles.photoGrid}>
            {photoPreviews.map((photo, index) => (
              <div
                className={styles.photoItem}
                key={`${photo.preview}-${index}`}
              >
                <img
                  src={
                    photo.existing
                      ? `${import.meta.env.VITE_API_URL}${photo.preview}`
                      : photo.preview
                  }
                  alt={`Article photo ${index + 1}`}
                  className={styles.photoPreview}
                />

                <button
                  type="button"
                  className={styles.removePhotoBtn}
                  onClick={() => removePhoto(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resource document upload */}
      <div className={styles.field}>
        <label className={styles.label}>
          Resource Document
        </label>

        {existingDocument && (
          <div className={styles.documentUploadInfo}>
            <p>
              Current document:{" "}
              {existingDocument.originalName ||
                existingDocument.filename ||
                "Uploaded document"}
            </p>

            <button
              type="button"
              onClick={() => setExistingDocument(null)}
            >
              Remove current document
            </button>
          </div>
        )}

        <input
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          onChange={handleDocumentChange}
        />

        {documentFile && (
          <div className={styles.documentUploadInfo}>
            <p>Selected: {documentFile.name}</p>

            <button
              type="button"
              onClick={() => setDocumentFile(null)}
            >
              Remove selected file
            </button>
          </div>
        )}

        <p>
          Accepted formats: PDF, DOC, DOCX, PPT, PPTX.
        </p>
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

export default ArticleForm;