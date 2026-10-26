
import { useState } from "react";

import useAIClassification from "./hooks/useAIClassification";
import ClassifierForm from "./components/ClassifierForm";
import ClassificationResult from "./components/ClassificationResult";

import {
  saveProjectDraft,
  publishProject,
  saveEvent,
  saveKnowledgeResource,
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
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [projectId, setProjectId] = useState(null);
  const [barangay, setBarangay] = useState("");
  const [status, setStatus] = useState("Planned");

  const [destination, setDestination] = useState("Projects");

  const [eventDateTime, setEventDateTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");

  const [knowledgeCategory, setKnowledgeCategory] =
    useState("Article");

  const [knowledgeReadTime, setKnowledgeReadTime] =
    useState("5");

  const [knowledgeContent, setKnowledgeContent] =
    useState("");

  const [knowledgePhotos, setKnowledgePhotos] =
    useState([]);

  const {
    result,
    loading,
    error,
    title,
    sourceFile,
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

  const handlePrimarySDGChange = (tag) => {
    setSdgTag(tag);

    if (tag && !selectedSDGs.includes(tag)) {
      handleToggleSDG(tag);
    }

    if (onResult) {
      onResult(tag);
    }
  };

  const buildProject = () => ({
    title: title.trim(),
    description: description.trim(),
    sdgTag,
    sdgTags: selectedSDGs,
    tags: projectTags,
    barangay: barangay.trim(),
    status,
    document: sourceFile, // NEW: retain the original uploaded file
  });

  const handleAIChanges = (changes) => {
    if (!changes) {
      return;
    }

    if (changes.title) {
      setTitle(changes.title);
    }

    if (changes.description) {
      setDescription(changes.description);
    }

    if (changes.barangay) {
      setBarangay(changes.barangay);
    }

    if (changes.status) {
      setStatus(changes.status);
    }

    if (changes.sdgTag) {
      setSdgTag(changes.sdgTag);

      if (!selectedSDGs.includes(changes.sdgTag)) {
        handleToggleSDG(changes.sdgTag);
      }

      if (onResult) {
        onResult(changes.sdgTag);
      }
    }

    if (Array.isArray(changes.sdgTags)) {
      changes.sdgTags.forEach((tag) => {
        if (!selectedSDGs.includes(tag)) {
          handleToggleSDG(tag);
        }
      });
    }

    if (Array.isArray(changes.tags)) {
      const currentTags = Array.isArray(projectTags)
        ? projectTags
        : [];

      changes.tags.forEach((tag) => {
        if (!currentTags.includes(tag)) {
          handleAddTag(tag);
        }
      });
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

  const handleSaveDraft = async () => {
    const validationError = validateProject();

    if (validationError) {
      setMessage(validationError);
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const saved = await saveProjectDraft(
        buildProject(),
        projectId
      );

      if (saved?._id) {
        setProjectId(saved._id);
      }

      setMessage("Project draft saved successfully.");
    } catch (err) {
      setMessage(
        err.message || "Unable to save the project draft."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    const validationError = validateProject();

    if (validationError) {
      setMessage(validationError);
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const saved = await saveProjectDraft(
        buildProject(),
        projectId
      );

      if (!saved?._id && !projectId) {
        throw new Error(
          "The server did not return the saved project ID."
        );
      }

      const id = saved?._id || projectId;

      setProjectId(id);

      await publishProject(id);

      setMessage("Project published successfully.");
    } catch (err) {
      setMessage(
        err.message || "Unable to publish the project."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEvent = async () => {
    if (
      !title.trim() ||
      !description.trim() ||
      !sdgTag ||
      !eventDateTime ||
      !eventLocation.trim()
    ) {
      setMessage("Please complete all event fields.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await saveEvent({
        title: title.trim(),
        description: description.trim(),
        sdgTag,
        date: eventDateTime,
        location: eventLocation.trim(),
        document: sourceFile, // NEW: retain the original uploaded file
      });

      setMessage("Event saved successfully.");
    } catch (err) {
      setMessage(err.message || "Unable to save event.");
    } finally {
      setSaving(false);
    }
  };

  // Save a Knowledge Hub resource using multipart/form-data
  const handleSaveKnowledge = async () => {
    const readTime = Number(knowledgeReadTime);

    if (
      !title.trim() ||
      !description.trim() ||
      !sdgTag ||
      !knowledgeContent.trim() ||
      !Number.isInteger(readTime) ||
      readTime < 1
    ) {
      setMessage(
        "Complete all Knowledge Hub fields and enter a valid read time."
      );
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await saveKnowledgeResource({
        title: title.trim(),
        summary: description.trim(),
        sdgTag,
        category: knowledgeCategory,
        readTime,
        content: knowledgeContent.trim(),
        photos: knowledgePhotos,
        document: sourceFile, // NEW: retain the original uploaded file
      });

      setMessage(
        "Knowledge Hub resource saved successfully."
      );

      setKnowledgePhotos([]);
      setKnowledgeContent("");
    } catch (err) {
      setMessage(
        err.message || "Unable to save Knowledge Hub resource."
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

    setDestination("Projects");

    setEventDateTime("");
    setEventLocation("");

    setKnowledgeCategory("Article");
    setKnowledgeReadTime("5");
    setKnowledgeContent("");
    setKnowledgePhotos([]);
  };

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <div className={styles.breadcrumb}>
            Admin Panel <span>/</span> AI Classifier
          </div>

          <h1>AI SDG Classifier</h1>

          <p>
            Identify which Sustainable Development Goals relate
            to a project using NLP classification.
          </p>
        </div>

        <div className={styles.headerBadge}>
          <span className={styles.statusDot} />
          AI Classification
        </div>
      </header>

      <section className={styles.introCard}>
        <div className={styles.introIcon}>✦</div>

        <div>
          <h2>Turn project information into SDG suggestions</h2>

          <p>
            Analyze project information, review multiple SDG
            suggestions, and confirm the details before saving.
          </p>
        </div>
      </section>

      <div className={styles.contentGrid}>
        <ClassifierForm
          loading={loading}
          onClassifyText={handleClassifyText}
          onClassifyFile={handleClassifyFile}
        />

        <ClassificationResult
          result={result}
          loading={loading}
          error={error}
          onUseResult={handleUseResult}
          onReset={handleReset}
          selectedSDGs={selectedSDGs}
          onToggleSDG={handleToggleSDG}
          selectedTags={projectTags}
          onToggleTag={handleToggleTag}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
        />
      </div>

      {result && !loading && (
        <>
          {/* Destination selector */}
          <section className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
              <div>
                <span className={styles.reviewEyebrow}>
                  SAVE CLASSIFICATION TO
                </span>

                <h2>Choose a destination</h2>

                <p>
                  Select where you want to use the classified
                  information.
                </p>
              </div>
            </div>

            <div className={styles.reviewField}>
              <label htmlFor="classification-destination">
                Destination
              </label>

              <select
                id="classification-destination"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setMessage("");
                }}
              >
                <option value="Projects">Projects</option>
                <option value="Events">Events</option>
                <option value="Knowledge Hub">Knowledge Hub</option>
              </select>
            </div>
          </section>

          {/* Events form */}
          {destination === "Events" && (
            <section className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <div>
                  <span className={styles.reviewEyebrow}>
                    EVENT DETAILS
                  </span>

                  <h2>Create SDG Event</h2>

                  <p>
                    Complete the event information before saving.
                  </p>
                </div>

                <span className={styles.reviewStatus}>
                  Event
                </span>
              </div>

              <div className={styles.reviewGrid}>
                <div className={styles.reviewField}>
                  <label htmlFor="event-title">
                    Event Title
                  </label>

                  <input
                    id="event-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={200}
                    placeholder="Enter event title"
                  />
                </div>

                <div className={styles.reviewField}>
                  <label htmlFor="event-sdg">
                    SDG Tag
                  </label>

                  <select
                    id="event-sdg"
                    value={sdgTag}
                    onChange={(e) => setSdgTag(e.target.value)}
                  >
                    <option value="">Select an SDG</option>

                    {Object.keys(SDG_COLORS).map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>

                <div
                  className={`${styles.reviewField} ${styles.fullWidth}`}
                >
                  <label htmlFor="event-description">
                    Description
                  </label>

                  <textarea
                    id="event-description"
                    value={description}
                    onChange={(e) =>
                      setDescription(e.target.value)
                    }
                    rows={4}
                    maxLength={10000}
                    placeholder="Describe the event"
                  />
                </div>

                <div className={styles.reviewField}>
                  <label htmlFor="event-date">
                    Date and Time
                  </label>

                  <input
                    id="event-date"
                    type="datetime-local"
                    value={eventDateTime}
                    onChange={(e) =>
                      setEventDateTime(e.target.value)
                    }
                  />
                </div>

                <div className={styles.reviewField}>
                  <label htmlFor="event-location">
                    Location
                  </label>

                  <input
                    id="event-location"
                    value={eventLocation}
                    onChange={(e) =>
                      setEventLocation(e.target.value)
                    }
                    placeholder="Enter event location"
                  />
                </div>
              </div>

              {message && (
                <p
                  className={styles.reviewSuccess}
                  role="status"
                >
                  {message}
                </p>
              )}

              <div className={styles.reviewActions}>
                <button
                  type="button"
                  className={styles.saveDraftButton}
                  onClick={handleSaveEvent}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Event"}
                </button>
              </div>

              <p className={styles.reviewFootnote}>
                Only authorized users can create events.
              </p>
            </section>
          )}

          {/* Knowledge Hub form */}
          {destination === "Knowledge Hub" && (
            <section className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <div>
                  <span className={styles.reviewEyebrow}>
                    KNOWLEDGE RESOURCE DETAILS
                  </span>

                  <h2>Create Knowledge Hub Resource</h2>

                  <p>
                    Prepare an educational resource connected
                    to an SDG.
                  </p>
                </div>

                <span className={styles.reviewStatus}>
                  Knowledge Hub
                </span>
              </div>

              <div className={styles.reviewGrid}>
                <div className={styles.reviewField}>
                  <label htmlFor="knowledge-title">
                    Title
                  </label>

                  <input
                    id="knowledge-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={200}
                    placeholder="Enter resource title"
                  />
                </div>

                <div className={styles.reviewField}>
                  <label htmlFor="knowledge-sdg">
                    SDG Tag
                  </label>

                  <select
                    id="knowledge-sdg"
                    value={sdgTag}
                    onChange={(e) => setSdgTag(e.target.value)}
                  >
                    <option value="">Select an SDG</option>

                    {Object.keys(SDG_COLORS).map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.reviewField}>
                  <label htmlFor="knowledge-category">
                    Category
                  </label>

                  <select
                    id="knowledge-category"
                    value={knowledgeCategory}
                    onChange={(e) =>
                      setKnowledgeCategory(e.target.value)
                    }
                  >
                    <option value="Guide">Guide</option>
                    <option value="Article">Article</option>
                    <option value="Resource">Resource</option>
                  </select>
                </div>

                <div className={styles.reviewField}>
                  <label htmlFor="knowledge-read-time">
                    Read Time (minutes)
                  </label>

                  <input
                    id="knowledge-read-time"
                    type="number"
                    min="1"
                    step="1"
                    value={knowledgeReadTime}
                    onChange={(e) =>
                      setKnowledgeReadTime(e.target.value)
                    }
                  />
                </div>

                <div
                  className={`${styles.reviewField} ${styles.fullWidth}`}
                >
                  <label htmlFor="knowledge-summary">
                    Summary
                  </label>

                  <textarea
                    id="knowledge-summary"
                    value={description}
                    onChange={(e) =>
                      setDescription(e.target.value)
                    }
                    rows={3}
                    maxLength={2000}
                    placeholder="Write a short summary"
                  />
                </div>

                <div
                  className={`${styles.reviewField} ${styles.fullWidth}`}
                >
                  <label htmlFor="knowledge-content">
                    Content
                  </label>

                  <textarea
                    id="knowledge-content"
                    value={knowledgeContent}
                    onChange={(e) =>
                      setKnowledgeContent(e.target.value)
                    }
                    rows={8}
                    placeholder="Write the full article, guide, or resource"
                  />
                </div>

                <div
                  className={`${styles.reviewField} ${styles.fullWidth}`}
                >
                  <label htmlFor="knowledge-photos">
                    Photos
                  </label>

                  <input
                    id="knowledge-photos"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={(e) => {
                      setKnowledgePhotos(
                        Array.from(e.target.files || [])
                      );
                    }}
                  />

                  <span className={styles.fieldHint}>
                    Select JPG, PNG, or WebP images. The backend
                    accepts up to 10 photos, each up to 10 MB.
                  </span>

                  {knowledgePhotos.length > 0 && (
                    <p>
                      {knowledgePhotos.length} photo(s) selected
                    </p>
                  )}
                </div>
              </div>

              {message && (
                <p
                  className={styles.reviewSuccess}
                  role="status"
                >
                  {message}
                </p>
              )}

              <div className={styles.reviewActions}>
                <button
                  type="button"
                  className={styles.saveDraftButton}
                  onClick={handleSaveKnowledge}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Resource"}
                </button>
              </div>

              <p className={styles.reviewFootnote}>
                Only authorized users can add Knowledge Hub
                resources.
              </p>
            </section>
          )}

          {/* Original Projects workflow */}
          {destination === "Projects" && (
            <section className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <div>
                  <span className={styles.reviewEyebrow}>
                    PROJECT REVIEW
                  </span>

                  <h2>Review project details</h2>

                  <p>
                    Confirm the information below. The
                    classification is only a suggestion until
                    you approve the selected SDGs.
                  </p>
                </div>

                <span className={styles.reviewStatus}>
                  {projectId ? "Draft saved" : "Not saved"}
                </span>
              </div>

              <div className={styles.reviewGrid}>
                <div className={styles.reviewField}>
                  <label htmlFor="review-title">
                    Project title
                  </label>

                  <input
                    id="review-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={200}
                    required
                  />
                </div>

                <div className={styles.reviewField}>
                  <label htmlFor="review-sdg">
                    Primary SDG
                  </label>

                  <select
                    id="review-sdg"
                    value={sdgTag}
                    onChange={(e) =>
                      handlePrimarySDGChange(e.target.value)
                    }
                    required
                  >
                    <option value="">Select an SDG</option>

                    {Array.from({ length: 17 }, (_, index) => (
                      <option
                        key={index + 1}
                        value={`SDG ${index + 1}`}
                      >
                        SDG {index + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.reviewField}>
                  <label htmlFor="review-barangay">
                    Barangay or community
                  </label>

                  <input
                    id="review-barangay"
                    value={barangay}
                    onChange={(e) => setBarangay(e.target.value)}
                    placeholder="Enter barangay or community"
                    required
                  />
                </div>

                <div className={styles.reviewField}>
                  <label htmlFor="review-status">
                    Project status
                  </label>

                  <select
                    id="review-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Planned">Planned</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div
                  className={`${styles.reviewField} ${styles.fullWidth}`}
                >
                  <label>Selected SDGs</label>

                  <div className={styles.sdgSelection}>
                    {Array.from({ length: 17 }, (_, index) => {
                      const tag = `SDG ${index + 1}`;
                      const selected = selectedSDGs.includes(tag);
                      const color = SDG_COLORS[tag] || "#3478f6";

                      return (
                        <label
                          key={tag}
                          className={styles.sdgOption}
                          style={{ "--sdg-color": color }}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => handleToggleSDG(tag)}
                          />

                          <span>{tag}</span>
                        </label>
                      );
                    })}
                  </div>

                  <span className={styles.fieldHint}>
                    {selectedSDGs.length} SDG
                    {selectedSDGs.length !== 1 ? "s" : ""} selected
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
                      setDescription(e.target.value)
                    }
                    rows={6}
                    maxLength={10000}
                    required
                  />
                </div>
              </div>

              {error && (
                <p
                  className={styles.reviewError}
                  role="alert"
                >
                  {error}
                </p>
              )}

              {message && (
                <p
                  className={styles.reviewSuccess}
                  role="status"
                >
                  {message}
                </p>
              )}

              <div className={styles.reviewActions}>
                <button
                  type="button"
                  className={styles.saveDraftButton}
                  onClick={handleSaveDraft}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Draft"}
                </button>

                <button
                  type="button"
                  className={styles.publishButton}
                  onClick={handlePublish}
                  disabled={saving}
                >
                  {saving ? "Processing..." : "Publish Project"}
                </button>
              </div>

              <p className={styles.reviewFootnote}>
                Publishing makes the project eligible for the
                public Showcase. Verify all details before
                publishing.
              </p>
            </section>
          )}
        </>
      )}

      <footer className={styles.pageFooter}>
        <span>SDG SMART HUB</span>

        <span>
          AI-generated suggestions should be reviewed by an admin.
        </span>
      </footer>
    </main>
  );
}

export default AIClassifier;
