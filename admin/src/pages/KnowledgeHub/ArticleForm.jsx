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
  const [photoPreviews, setPhotoPreviews] =
    useState([]);

  useEffect(() => {
    const data =
      initialData || EMPTY_ARTICLE;

    setForm({
      ...data,
      summary: data.summary || "",
      readTime:
        data.readTime || "5 min read",
      photos: data.photos || [],
    });

    const existingPhotos =
      data.photos || [];

    const previews = existingPhotos.map(
      (photo) => ({
        source: photo,
        preview: photo,
        existing: true,
      })
    );

    setPhotoPreviews(previews);
  }, [initialData]);

  const handlePhotoChange = (e) => {
    const files = Array.from(
      e.target.files || []
    );

    if (!files.length) {
      return;
    }

    const availableSlots =
      10 - photoPreviews.length;

    const selectedFiles =
      files.slice(0, availableSlots);

    const newPhotos =
      selectedFiles.map((file) => ({
        source: file,
        preview:
          URL.createObjectURL(file),
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

    e.target.value = "";
  };

  const removePhoto = (index) => {
    const photo =
      photoPreviews[index];

    if (
      photo &&
      !photo.existing &&
      photo.preview
    ) {
      URL.revokeObjectURL(
        photo.preview
      );
    }

    setPhotoPreviews((current) =>
      current.filter(
        (_, photoIndex) =>
          photoIndex !== index
      )
    );

    setForm((current) => {
      const photos = [
        ...(current.photos || []),
      ];

      if (photo.existing) {
        const existingPhotos =
          photos.filter(
            (item) =>
              typeof item === "string"
          );

        const filePhotos =
          photos.filter(
            (item) =>
              item instanceof File
          );

        const existingIndex =
          photoPreviews
            .slice(0, index)
            .filter(
              (item) =>
                item.existing
            ).length;

        existingPhotos.splice(
          existingIndex,
          1
        );

        return {
          ...current,
          photos: [
            ...existingPhotos,
            ...filePhotos,
          ],
        };
      }

      const fileIndex =
        photoPreviews
          .slice(0, index)
          .filter(
            (item) =>
              !item.existing
          ).length;

      const filePhotos =
        photos.filter(
          (item) =>
            item instanceof File
        );

      filePhotos.splice(
        fileIndex,
        1
      );

      const existingPhotos =
        photos.filter(
          (item) =>
            typeof item === "string"
        );

      return {
        ...current,
        photos: [
          ...existingPhotos,
          ...filePhotos,
        ],
      };
    });
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
          onChange={(e) =>
            setForm({
              ...form,
              title: e.target.value,
            })
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
          onChange={(e) =>
            setForm({
              ...form,
              summary: e.target.value,
            })
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
            value={form.sdgTag}
            onChange={(e) =>
              setForm({
                ...form,
                sdgTag: e.target.value,
              })
            }
          >
            {SDG_OPTIONS.map((s) => (
              <option key={s}>
                {s}
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
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value,
              })
            }
          >
            {CATEGORIES.map((c) => (
              <option key={c}>
                {c}
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
          onChange={(e) =>
            setForm({
              ...form,
              readTime: e.target.value,
            })
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
          onChange={(e) =>
            setForm({
              ...form,
              content: e.target.value,
            })
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
          disabled={
            photoPreviews.length >= 10
          }
        />

        {photoPreviews.length > 0 && (
          <div className={styles.photoGrid}>
            {photoPreviews.map(
              (photo, index) => (
                <div
                  className={
                    styles.photoItem
                  }
                  key={`${photo.preview}-${index}`}
                >
                  <img
                    src={
                      photo.existing
                        ? `http://localhost:5000${photo.preview}`
                        : photo.preview
                    }
                    alt={`Article photo ${
                      index + 1
                    }`}
                    className={
                      styles.photoPreview
                    }
                  />

                  <button
                    type="button"
                    className={
                      styles.removePhotoBtn
                    }
                    onClick={() =>
                      removePhoto(index)
                    }
                  >
                    Remove
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>

      <div className={styles.modalFooter}>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={onClose}
        >
          Cancel
        </button>

        <button
          type="submit"
          className={styles.saveBtn}
          disabled={saving}
        >
          {saving
            ? "Saving…"
            : "Save"}
        </button>
      </div>
    </form>
  );
}

export default ArticleForm;