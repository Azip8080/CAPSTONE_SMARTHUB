import { useState } from "react";

import useAIClassification from "./hooks/useAIClassification";

import ClassifierForm from "./components/ClassifierForm";
import ClassificationResult from "./components/ClassificationResult";


import {
  saveProjectDraft,
  publishProject,
} from "./aiClassifierService";

import styles from "./AIClassifier.module.css";

const SDG_COLORS = {
  "SDG 1": "#E5243B",
  "SDG 2": "#DDA63A",
  "SDG 3": "#4C9F38",
  "SDG 4": "#C5192D",
  "SDG 5": "#FF3A21",
  "SDG 6": "#26BDE2",
  "SDG 7": "#FCC30B",
  "SDG 8": "#A21942",
  "SDG 9": "#FD6925",
  "SDG 10": "#DD1367",
  "SDG 11": "#FD9D24",
  "SDG 12": "#BF8B2E",
  "SDG 13": "#3F7E44",
  "SDG 14": "#0A97D9",
  "SDG 15": "#56C02B",
  "SDG 16": "#00689D",
  "SDG 17": "#19486A",
};

function AIClassifier({ onResult }) {
  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [projectId, setProjectId] =
    useState(null);

  const [barangay, setBarangay] =
    useState("");

  const [status, setStatus] =
    useState("Planned");

  const {
    result,
    loading,
    error,
    title,
    description,
    sdgTag,
    selectedSDGs,
    projectTags,
    setTitle,
    setDescription,
    setSdgTag,
    handleClassifyText,
    handleClassifyFile,
    handleToggleSDG,
    handleToggleTag,
    handleAddTag,
    handleRemoveTag,
    resetClassification,
  } = useAIClassification();

  const handleUseResult = (tag) => {
    setSdgTag(tag);

    if (onResult) {
      onResult(tag);
    }
  };

  const handlePrimarySDGChange = (
    tag
  ) => {
    setSdgTag(tag);

    if (
      tag &&
      !selectedSDGs.includes(tag)
    ) {
      handleToggleSDG(tag);
    }

    if (onResult) {
      onResult(tag);
    }
  };

  const buildProject = () => ({
    title: title.trim(),
    description:
      description.trim(),
    sdgTag,
    sdgTags: selectedSDGs,
    tags: projectTags,
    barangay:
      barangay.trim(),
    status,
  });

  const handleAIChanges = (
    changes
  ) => {
    if (!changes) {
      return;
    }

    if (changes.title) {
      setTitle(changes.title);
    }

    if (changes.description) {
      setDescription(
        changes.description
      );
    }

    if (changes.barangay) {
      setBarangay(
        changes.barangay
      );
    }

    if (changes.status) {
      setStatus(changes.status);
    }

    if (changes.sdgTag) {
      setSdgTag(
        changes.sdgTag
      );

      if (
        !selectedSDGs.includes(
          changes.sdgTag
        )
      ) {
        handleToggleSDG(
          changes.sdgTag
        );
      }

      if (onResult) {
        onResult(
          changes.sdgTag
        );
      }
    }

    if (
      Array.isArray(
        changes.sdgTags
      )
    ) {
      changes.sdgTags.forEach(
        (tag) => {
          if (
            !selectedSDGs.includes(
              tag
            )
          ) {
            handleToggleSDG(tag);
          }
        }
      );
    }

    if (
      Array.isArray(
        changes.tags
      )
    ) {
      const currentTags =
        Array.isArray(projectTags)
          ? projectTags
          : [];

      changes.tags.forEach(
        (tag) => {
          if (
            !currentTags.includes(
              tag
            )
          ) {
            handleAddTag(tag);
          }
        }
      );
    }
  };

  const validateProject = () => {
    if (!title.trim()) {
      return "Enter a project title.";
    }

    if (!description.trim()) {
      return "Enter a project description.";
    }

    if (!sdgTag.trim()) {
      return "Select a primary SDG.";
    }

    if (!selectedSDGs.length) {
      return "Select at least one SDG.";
    }

    if (!barangay.trim()) {
      return "Enter the barangay or community.";
    }

    return "";
  };

  const handleSaveDraft =
    async () => {
      const validationError =
        validateProject();

      if (validationError) {
        setMessage(
          validationError
        );
        return;
      }

      setSaving(true);
      setMessage("");

      try {
        const saved =
          await saveProjectDraft(
            buildProject(),
            projectId
          );

        if (saved?._id) {
          setProjectId(
            saved._id
          );
        }

        setMessage(
          "Project draft saved successfully."
        );
      } catch (err) {
        setMessage(
          err.message ||
            "Unable to save the project draft."
        );
      } finally {
        setSaving(false);
      }
    };

  const handlePublish =
    async () => {
      const validationError =
        validateProject();

      if (validationError) {
        setMessage(
          validationError
        );
        return;
      }

      setSaving(true);
      setMessage("");

      try {
        const saved =
          await saveProjectDraft(
            buildProject(),
            projectId
          );

        if (
          !saved?._id &&
          !projectId
        ) {
          throw new Error(
            "The server did not return the saved project ID."
          );
        }

        const id =
          saved?._id ||
          projectId;

        setProjectId(id);

        await publishProject(id);

        setMessage(
          "Project published successfully."
        );
      } catch (err) {
        setMessage(
          err.message ||
            "Unable to publish the project."
        );
      } finally {
        setSaving(false);
      }
    };

  const handleReset = () => {
    resetClassification();
    setMessage("");
    setProjectId(null);
    setBarangay("");
    setStatus("Planned");
  };

  return (
    <main className={styles.page}>
      <header
        className={
          styles.pageHeader
        }
      >
        <div>
          <div
            className={
              styles.breadcrumb
            }
          >
            Admin Panel{" "}
            <span>/</span> AI Classifier
          </div>

          <h1>
            AI SDG Classifier
          </h1>

          <p>
            Identify which Sustainable
            Development Goals relate to
            a project using NLP
            classification.
          </p>
        </div>

        <div
          className={
            styles.headerBadge
          }
        >
          <span
            className={
              styles.statusDot
            }
          />
          AI Classification
        </div>
      </header>

      <section
        className={
          styles.introCard
        }
      >
        <div
          className={
            styles.introIcon
          }
        >
          ✦
        </div>

        <div>
          <h2>
            Turn project information
            into SDG suggestions
          </h2>

          <p>
            Analyze project information,
            review multiple SDG
            suggestions, and confirm
            the project details before
            publishing.
          </p>
        </div>
      </section>

      <div
        className={
          styles.contentGrid
        }
      >
        <ClassifierForm
          loading={loading}
          onClassifyText={
            handleClassifyText
          }
          onClassifyFile={
            handleClassifyFile
          }
        />

        <ClassificationResult
          result={result}
          loading={loading}
          error={error}
          onUseResult={
            handleUseResult
          }
          onReset={handleReset}
          selectedSDGs={
            selectedSDGs
          }
          onToggleSDG={
            handleToggleSDG
          }
          selectedTags={
            projectTags
          }
          onToggleTag={
            handleToggleTag
          }
          onAddTag={
            handleAddTag
          }
          onRemoveTag={
            handleRemoveTag
          }
        />
      </div>

      {result && !loading && (
        <section
          className={
            styles.reviewCard
          }
        >
          <div
            className={
              styles.reviewHeader
            }
          >
            <div>
              <span
                className={
                  styles.reviewEyebrow
                }
              >
                PROJECT REVIEW
              </span>

              <h2>
                Review project details
              </h2>

              <p>
                Confirm the information
                below. The classification
                is only a suggestion until
                you approve the selected
                SDGs.
              </p>
            </div>

            <span
              className={
                styles.reviewStatus
              }
            >
              {projectId
                ? "Draft saved"
                : "Not saved"}
            </span>
          </div>

          <div
            className={
              styles.reviewGrid
            }
          >
            <div
              className={
                styles.reviewField
              }
            >
              <label htmlFor="review-title">
                Project title
              </label>

              <input
                id="review-title"
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
                maxLength={200}
                required
              />
            </div>

            <div
              className={
                styles.reviewField
              }
            >
              <label htmlFor="review-sdg">
                Primary SDG
              </label>

              <select
                id="review-sdg"
                value={sdgTag}
                onChange={(e) =>
                  handlePrimarySDGChange(
                    e.target.value
                  )
                }
                required
              >
                <option value="">
                  Select an SDG
                </option>

                {Array.from(
                  { length: 17 },
                  (_, index) => (
                    <option
                      key={
                        index + 1
                      }
                      value={`SDG ${
                        index + 1
                      }`}
                    >
                      SDG{" "}
                      {index + 1}
                    </option>
                  )
                )}
              </select>
            </div>

            <div
              className={
                styles.reviewField
              }
            >
              <label htmlFor="review-barangay">
                Barangay or community
              </label>

              <input
                id="review-barangay"
                value={barangay}
                onChange={(e) =>
                  setBarangay(
                    e.target.value
                  )
                }
                placeholder="Enter barangay or community"
                required
              />
            </div>

            <div
              className={
                styles.reviewField
              }
            >
              <label htmlFor="review-status">
                Project status
              </label>

              <select
                id="review-status"
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value
                  )
                }
              >
                <option value="Planned">
                  Planned
                </option>

                <option value="Ongoing">
                  Ongoing
                </option>

                <option value="Completed">
                  Completed
                </option>
              </select>
            </div>

            <div
              className={`${styles.reviewField} ${styles.fullWidth}`}
            >
              <label>
                Selected SDGs
              </label>

              <div
                className={
                  styles.sdgSelection
                }
              >
                {Array.from(
                  { length: 17 },
                  (_, index) => {
                    const tag =
                      `SDG ${
                        index + 1
                      }`;

                    const selected =
                      selectedSDGs.includes(
                        tag
                      );

                    const color =
                      SDG_COLORS[tag] ||
                      "#3478f6";

                    return (
                      <label
                        key={tag}
                        className={
                          styles.sdgOption
                        }
                        style={{
                          "--sdg-color":
                            color,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={
                            selected
                          }
                          onChange={() =>
                            handleToggleSDG(
                              tag
                            )
                          }
                        />

                        <span>
                          {tag}
                        </span>
                      </label>
                    );
                  }
                )}
              </div>

              <span
                className={
                  styles.fieldHint
                }
              >
                {
                  selectedSDGs.length
                }{" "}
                SDG
                {selectedSDGs.length !==
                1
                  ? "s"
                  : ""}{" "}
                selected
              </span>
            </div>

            <div
              className={`${styles.reviewField} ${styles.fullWidth}`}
            >
              <label htmlFor="review-description">
                Project description
              </label>

              <textarea
                id="review-description"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                rows={6}
                maxLength={10000}
                required
              />
            </div>
          </div>

          {error && (
            <p
              className={
                styles.reviewError
              }
              role="alert"
            >
              {error}
            </p>
          )}

          {message && (
            <p
              className={
                styles.reviewSuccess
              }
              role="status"
            >
              {message}
            </p>
          )}

          <div
            className={
              styles.reviewActions
            }
          >
            <button
              type="button"
              className={
                styles.saveDraftButton
              }
              onClick={
                handleSaveDraft
              }
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Draft"}
            </button>

            <button
              type="button"
              className={
                styles.publishButton
              }
              onClick={
                handlePublish
              }
              disabled={saving}
            >
              {saving
                ? "Processing..."
                : "Publish Project"}
            </button>
          </div>

          <p
            className={
              styles.reviewFootnote
            }
          >
            Publishing makes the
            project eligible for the
            public Showcase. Verify all
            details before publishing.
          </p>
        </section>
      )}

      <footer
        className={
          styles.pageFooter
        }
      >
        <span>
          SDG SMART HUB
        </span>

        <span>
          AI-generated suggestions
          should be reviewed by an
          admin.
        </span>
      </footer>
    </main>
  );
}

export default AIClassifier;