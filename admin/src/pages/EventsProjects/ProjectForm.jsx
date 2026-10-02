import { useEffect, useState } from "react";
import styles from "./Form.module.css";
import {
  SDG_OPTIONS,
  STATUS_OPTIONS,
  EMPTY_PROJECT,
} from "./constants.js";

function ProjectForm({
  initialData,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(
    initialData || EMPTY_PROJECT
  );

  const [saving, setSaving] = useState(false);
  const [photoPreviews, setPhotoPreviews] =
    useState([]);

  useEffect(() => {
    const data =
      initialData || EMPTY_PROJECT;

    setForm({
      ...data,
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

  const handleChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handlePhotoChange = (e) => {
  const files = Array.from(
    e.target.files || []
  );

  console.log("PHOTO INPUT FIRED");
  console.log("SELECTED FILES:", files);

  if (!files.length) {
    return;
  }

  const availableSlots =
    10 - photoPreviews.length;

  const selectedFiles =
    files.slice(0, availableSlots);

  console.log(
    "FILES TO SAVE:",
    selectedFiles
  );

  const newPhotos =
    selectedFiles.map((file) => ({
      source: file,
      preview: URL.createObjectURL(
        file
      ),
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

  console.log("FORM SUBMIT");
  console.log("FORM DATA:", form);
  console.log("FORM PHOTOS:", form.photos);

  setSaving(true);

  try {
    await onSubmit(form);
  } finally {
    setSaving(false);
  }
};

  const isEditing = Boolean(
    initialData?._id
  );

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
    >
      <div className={styles.formHeader}>
        <div>
          <h2 className={styles.formTitle}>
            {isEditing
              ? "Edit Project"
              : "Add Project"}
          </h2>

          <p className={styles.formSubtitle}>
            {isEditing
              ? "Update the project information and documentation."
              : "Add a new SDG project to the community platform."}
          </p>
        </div>
      </div>

      <div className={styles.formBody}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              Project Information
            </h3>

            <p className={styles.sectionDescription}>
              Provide the basic details of the project.
            </p>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              Project Title
              <span className={styles.required}>
                *
              </span>
            </label>

            <input
              className={styles.input}
              value={form.title || ""}
              onChange={(e) =>
                handleChange(
                  "title",
                  e.target.value
                )
              }
              placeholder="Enter project title"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              Description
              <span className={styles.required}>
                *
              </span>
            </label>

            <textarea
              className={styles.textarea}
              rows={4}
              value={
                form.description || ""
              }
              onChange={(e) =>
                handleChange(
                  "description",
                  e.target.value
                )
              }
              placeholder="Describe the project's purpose, activities, and expected results"
              required
            />
          </div>

          <div className={styles.twoColumn}>
            <div className={styles.field}>
              <label className={styles.label}>
                SDG Goal
                <span className={styles.required}>
                  *
                </span>
              </label>

              <select
                className={styles.select}
                value={form.sdgTag || ""}
                onChange={(e) =>
                  handleChange(
                    "sdgTag",
                    e.target.value
                  )
                }
              >
                {SDG_OPTIONS.map((sdg) => (
                  <option
                    key={sdg}
                    value={sdg}
                  >
                    {sdg}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                Status
                <span className={styles.required}>
                  *
                </span>
              </label>

              <select
                className={styles.select}
                value={form.status || ""}
                onChange={(e) =>
                  handleChange(
                    "status",
                    e.target.value
                  )
                }
              >
                {STATUS_OPTIONS.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              Barangay
              <span className={styles.required}>
                *
              </span>
            </label>

            <input
              className={styles.input}
              value={form.barangay || ""}
              onChange={(e) =>
                handleChange(
                  "barangay",
                  e.target.value
                )
              }
              placeholder="Enter barangay"
              required
            />
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h3 className={styles.sectionTitle}>
                Project Photos
              </h3>

              <p className={styles.sectionDescription}>
                Add photos showing project activities,
                events, participants, or results.
              </p>
            </div>

            <span className={styles.photoCount}>
              {photoPreviews.length} / 10
            </span>
          </div>

          <div className={styles.photoUploadArea}>
            <label
              className={`${styles.addPhotoCard} ${
                photoPreviews.length >= 10
                  ? styles.disabledUpload
                  : ""
              }`}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={
                  handlePhotoChange
                }
                disabled={
                  photoPreviews.length >=
                  10
                }
              />

              <span className={styles.uploadIcon}>
                +
              </span>

              <span className={styles.uploadTitle}>
                Add Photos
              </span>

              <span className={styles.uploadText}>
                JPG, PNG or WebP
              </span>
            </label>

            {photoPreviews.map(
              (photo, index) => (
                <div
                  key={`${photo.preview}-${index}`}
                  className={
                    styles.photoPreview
                  }
                >
                  <img
                    src={photo.preview}
                    alt={`Project photo ${
                      index + 1
                    }`}
                  />

                  <button
                    type="button"
                    className={
                      styles.removePhoto
                    }
                    onClick={() =>
                      removePhoto(index)
                    }
                    aria-label={`Remove photo ${
                      index + 1
                    }`}
                  >
                    ×
                  </button>

                  {photo.existing && (
                    <span
                      className={
                        styles.existingBadge
                      }
                    >
                      Saved
                    </span>
                  )}
                </div>
              )
            )}
          </div>

          <p className={styles.photoHint}>
            You can upload up to 10 photos.
            Use clear images of activities,
            events, participants, or project
            results.
          </p>
        </section>
      </div>

      <div className={styles.formFooter}>
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
          {saving
            ? "Saving..."
            : isEditing
            ? "Save Changes"
            : "Save Project"}
        </button>
      </div>
    </form>
  );
}

export default ProjectForm;