import { useState } from "react";
import ClassifierForm from "./ClassifierForm";
import ClassificationResult from "./ClassificationResult";
import {
  classifyText,
  classifyFile,
  saveProjectDraft,
  publishProject,
} from "./aiClassifierService";
import styles from "./AIClassifier.module.css";

function AIClassifier({ onResult }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [projectId, setProjectId] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [barangay, setBarangay] = useState("");
  const [status, setStatus] = useState("Planned");
  const [sdgTag, setSdgTag] = useState("");

  const runClassification = async (request, details = {}) => {
    setLoading(true);
    setError("");
    setMessage("");
    setResult(null);
    setProjectId(null);

    try {
      const data = await request();

      setResult(data);
      setTitle(details.title || data.filename?.replace(/\.[^.]+$/, "") || "");
      setDescription(details.description || "");
      setSdgTag(data.tag || data.sdgTag || "");
      setStatus("Planned");
    } catch (err) {
      setError(err.message || "Unable to classify this content.");
    } finally {
      setLoading(false);
    }
  };

  const handleClassifyText = (submittedTitle, submittedDescription) =>
    runClassification(
      () => classifyText(submittedTitle, submittedDescription),
      {
        title: submittedTitle,
        description: submittedDescription,
      }
    );

  const handleClassifyFile = (file) =>
    runClassification(() => classifyFile(file), {
      title: file.name.replace(/\.[^.]+$/, ""),
      description: "",
    });

  const handleUseResult = (tag) => {
    setSdgTag(tag);
    if (onResult) onResult(tag);
  };

  const buildProject = () => ({
    title: title.trim(),
    description: description.trim(),
    sdgTag,
    barangay: barangay.trim(),
    status,
  });

  const validateProject = () => {
    if (!title.trim()) return "Enter a project title.";
    if (!description.trim()) return "Enter a project description.";
    if (!sdgTag.trim()) return "Select an SDG tag.";
    if (!barangay.trim()) return "Enter the barangay or community.";
    return "";
  };

  const handleSaveDraft = async () => {
    const validationError = validateProject();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const saved = await saveProjectDraft(buildProject(), projectId);

      if (saved?._id) setProjectId(saved._id);

      setMessage("Project draft saved successfully.");
    } catch (err) {
      setError(err.message || "Unable to save the project draft.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    const validationError = validateProject();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      // Save the latest edits first, then publish the saved project.
      const saved = await saveProjectDraft(buildProject(), projectId);

      if (!saved?._id && !projectId) {
        throw new Error("The server did not return the saved project ID.");
      }

      const id = saved?._id || projectId;
      setProjectId(id);

      await publishProject(id);

      setMessage("Project published successfully.");
    } catch (err) {
      setError(err.message || "Unable to publish the project.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError("");
    setMessage("");
    setProjectId(null);
    setTitle("");
    setDescription("");
    setBarangay("");
    setStatus("Planned");
    setSdgTag("");
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
            Identify which Sustainable Development Goal best relates
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
            Analyze project information, review the suggested SDG,
            and confirm the project details before publishing.
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
        />
      </div>

      {result && !loading && (
        <section className={styles.reviewCard}>
          <div className={styles.reviewHeader}>
            <div>
              <span className={styles.reviewEyebrow}>
                PROJECT REVIEW
              </span>
              <h2>Review project details</h2>
              <p>
                Confirm the information below. The classification
                is only a suggestion until you approve the SDG tag.
              </p>
            </div>

            <span className={styles.reviewStatus}>
              {projectId ? "Draft saved" : "Not saved"}
            </span>
          </div>

          <div className={styles.reviewGrid}>
            <div className={styles.reviewField}>
              <label htmlFor="review-title">Project title</label>
              <input
                id="review-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                required
              />
            </div>

            <div className={styles.reviewField}>
              <label htmlFor="review-sdg">SDG tag</label>
              <select
                id="review-sdg"
                value={sdgTag}
                onChange={(e) => setSdgTag(e.target.value)}
                required
              >
                <option value="">Select an SDG</option>
                {Array.from({ length: 17 }, (_, index) => (
                  <option key={index + 1} value={`SDG ${index + 1}`}>
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
              <label htmlFor="review-status">Project status</label>
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

            <div className={`${styles.reviewField} ${styles.fullWidth}`}>
              <label htmlFor="review-description">
                Project description
              </label>
              <textarea
                id="review-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                maxLength={10000}
                required
              />
            </div>
          </div>

          {error && (
            <p className={styles.reviewError} role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className={styles.reviewSuccess} role="status">
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
            Publishing makes the project eligible for the public
            Showcase. Verify all details before publishing.
          </p>
        </section>
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