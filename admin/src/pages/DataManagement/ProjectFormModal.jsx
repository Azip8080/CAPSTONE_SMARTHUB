import { useState } from "react";
import styles from "./ProjectFormModal.module.css";

import {
  SDG_OPTIONS,
  STATUS_OPTIONS,
  EMPTY_FORM,
} from "./constants.js";

function ProjectFormModal({
  initialData,
  isEdit,
  onClose,
  onSubmit,
}) {
  const initialForm = {
    ...EMPTY_FORM,
    sdgTags: [],
    tags: [],
    photos: [],
    ...initialData,
  };

  if (
    (!initialForm.sdgTags ||
      initialForm.sdgTags.length === 0) &&
    initialForm.sdgTag
  ) {
    initialForm.sdgTags = [
      initialForm.sdgTag,
    ];
  }

  const [form, setForm] =
    useState(initialForm);

  const [saving, setSaving] =
    useState(false);

  const handleChange = (
    field,
    value
  ) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  const handleSDGChange = (
    sdg
  ) => {
    const current =
      form.sdgTags || [];

    const updated =
      current.includes(sdg)
        ? current.filter(
            (item) =>
              item !== sdg
          )
        : [...current, sdg];

    setForm({
      ...form,
      sdgTags: updated,
      sdgTag:
        updated.includes(
          form.sdgTag
        )
          ? form.sdgTag
          : updated[0] ||
            form.sdgTag,
    });
  };

  const handlePrimarySDGChange = (
    sdg
  ) => {
    const current =
      form.sdgTags || [];

    const updated =
      current.includes(sdg)
        ? current
        : [sdg, ...current];

    setForm({
      ...form,
      sdgTag: sdg,
      sdgTags: updated,
    });
  };

  const handleTagsChange = (
    e
  ) => {
    const tags = e.target.value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    setForm({
      ...form,
      tags,
    });
  };

  const handlePhotoChange = (
    e
  ) => {
    const files = Array.from(
      e.target.files || []
    );

    setForm({
      ...form,
      photos: [
        ...(form.photos || []),
        ...files,
      ],
    });

    e.target.value = "";
  };

  const removePhoto = (
    index
  ) => {
    const photos = [
      ...(form.photos || []),
    ];

    photos.splice(index, 1);

    setForm({
      ...form,
      photos,
    });
  };

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    if (
      !form.sdgTags ||
      form.sdgTags.length === 0
    ) {
      alert(
        "Select at least one SDG."
      );
      return;
    }

    setSaving(true);

    try {
      await onSubmit(form);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const selectedSDGs =
    form.sdgTags || [];

  const photos =
    form.photos || [];

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
    >
      <div
        className={styles.modal}
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div
          className={
            styles.modalHeader
          }
        >
          <h2
            className={
              styles.modalTitle
            }
          >
            {isEdit
              ? "Edit project"
              : "Add project"}
          </h2>

          <button
            type="button"
            className={
              styles.closeBtn
            }
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form
          className={styles.form}
          onSubmit={handleSubmit}
        >
          <div
            className={styles.field}
          >
            <label
              className={styles.label}
            >
              Title
            </label>

            <input
              className={styles.input}
              value={
                form.title || ""
              }
              onChange={(e) =>
                handleChange(
                  "title",
                  e.target.value
                )
              }
              required
            />
          </div>

          <div
            className={styles.field}
          >
            <label
              className={styles.label}
            >
              Description
            </label>

            <textarea
              className={
                styles.textarea
              }
              rows={3}
              value={
                form.description ||
                ""
              }
              onChange={(e) =>
                handleChange(
                  "description",
                  e.target.value
                )
              }
              required
            />
          </div>

          <div
            className={styles.field}
          >
            <label
              className={styles.label}
            >
              SDG Tags
            </label>

            <div
              className={
                styles.sdgGrid
              }
            >
              {SDG_OPTIONS.map(
                (sdg) => (
                  <label
                    key={sdg}
                    className={
                      styles.sdgOption
                    }
                  >
                    <input
                      type="checkbox"
                      checked={selectedSDGs.includes(
                        sdg
                      )}
                      onChange={() =>
                        handleSDGChange(
                          sdg
                        )
                      }
                    />

                    <span>
                      {sdg}
                    </span>
                  </label>
                )
              )}
            </div>
          </div>

          <div
            className={styles.row}
          >
            <div
              className={
                styles.field
              }
            >
              <label
                className={
                  styles.label
                }
              >
                Primary SDG
              </label>

              <select
                className={
                  styles.select2
                }
                value={
                  form.sdgTag ||
                  "SDG 1"
                }
                onChange={(e) =>
                  handlePrimarySDGChange(
                    e.target.value
                  )
                }
              >
                {SDG_OPTIONS.map(
                  (sdg) => (
                    <option
                      key={sdg}
                      value={sdg}
                    >
                      {sdg}
                    </option>
                  )
                )}
              </select>
            </div>

            <div
              className={
                styles.field
              }
            >
              <label
                className={
                  styles.label
                }
              >
                Status
              </label>

              <select
                className={
                  styles.select2
                }
                value={
                  form.status ||
                  "Planned"
                }
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

          <div
            className={styles.field}
          >
            <label
              className={styles.label}
            >
              Barangay
            </label>

            <input
              className={styles.input}
              value={
                form.barangay || ""
              }
              onChange={(e) =>
                handleChange(
                  "barangay",
                  e.target.value
                )
              }
              required
            />
          </div>

          <div
            className={styles.field}
          >
            <label
              className={styles.label}
            >
              Project Tags
            </label>

            <input
              className={styles.input}
              value={
                (form.tags || []).join(
                  ", "
                )
              }
              onChange={
                handleTagsChange
              }
              placeholder="Example: Livelihood, Training, Community"
            />
          </div>

          <div
            className={styles.field}
          >
            <label
              className={styles.label}
            >
              Project Photos
            </label>

            <input
              className={styles.input}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={
                handlePhotoChange
              }
            />

            {photos.length > 0 && (
              <div
                className={
                  styles.photoList
                }
              >
                {photos.map(
                  (photo, index) => {
                    const name =
                      photo instanceof
                      File
                        ? photo.name
                        : photo
                            .split(
                              "/"
                            )
                            .pop();

                    return (
                      <div
                        key={`${name}-${index}`}
                        className={
                          styles.photoItem
                        }
                      >
                        <span>
                          {name}
                        </span>

                        <button
                          type="button"
                          className={
                            styles.removePhotoBtn
                          }
                          onClick={() =>
                            removePhoto(
                              index
                            )
                          }
                        >
                          Remove
                        </button>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>

          <div
            className={
              styles.modalFooter
            }
          >
            <button
              type="button"
              className={
                styles.cancelBtn
              }
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={
                styles.saveBtn
              }
              disabled={saving}
            >
              {saving
                ? "Saving…"
                : "Save project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProjectFormModal;