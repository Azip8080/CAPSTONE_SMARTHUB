import { useRef, useState } from "react";
import styles from "./ClassifierForm.module.css";

function ClassifierForm({
  loading,
  onClassifyText,
  onClassifyFile,
}) {
  const [tab, setTab] = useState("text");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);

  const validateFile = (selected) => {
    if (!selected) return false;

    const allowedExtensions = [".pdf", ".txt"];
    const extension = selected.name
      .slice(selected.name.lastIndexOf("."))
      .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      alert("Please select a PDF or TXT file.");
      return false;
    }

    if (selected.size > 10 * 1024 * 1024) {
      alert("The maximum file size is 10 MB.");
      return false;
    }

    return true;
  };

  const handleTextSubmit = (event) => {
    event.preventDefault();
    onClassifyText(title, description);
  };

  const handleFileSubmit = (event) => {
    event.preventDefault();

    if (file) {
      onClassifyFile(file);
    }
  };

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];

    if (validateFile(selected)) {
      setFile(selected);
    } else {
      setFile(null);
      event.target.value = "";
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const dropped = event.dataTransfer.files?.[0];

    if (validateFile(dropped)) {
      setFile(dropped);

      if (fileRef.current) {
        fileRef.current.value = "";
      }
    } else {
      setFile(null);

      if (fileRef.current) {
        fileRef.current.value = "";
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  return (
    <section className={styles.card}>
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>
            STEP 01 · PROJECT INPUT
          </span>

          <h2>Start an AI analysis</h2>

          <p>
            Provide project information or upload
            an existing project document.
          </p>
        </div>

        <span className={styles.step}>01</span>
      </div>

      <div className={styles.tabs}>
        <button
          type="button"
          className={
            tab === "text"
              ? styles.activeTab
              : styles.tab
          }
          onClick={() => setTab("text")}
        >
          <span>✎</span>
          Text input
        </button>

        <button
          type="button"
          className={
            tab === "file"
              ? styles.activeTab
              : styles.tab
          }
          onClick={() => setTab("file")}
        >
          <span>↑</span>
          Upload document
        </button>
      </div>

      {tab === "text" ? (
        <form
          onSubmit={handleTextSubmit}
          className={styles.form}
        >
          <div className={styles.field}>
            <label htmlFor="project-title">
              Project title
            </label>

            <input
              id="project-title"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="e.g. Community Tree Planting"
              maxLength={200}
            />
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label htmlFor="project-description">
                Project description
              </label>

              <span className={styles.counter}>
                {description.length}/10,000
              </span>
            </div>

            <textarea
              id="project-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Describe the objectives, activities, beneficiaries, location, and expected impact..."
              rows={7}
              maxLength={10000}
            />
          </div>

          <button
            type="submit"
            className={styles.primaryButton}
            disabled={
              loading ||
              (!title.trim() &&
                !description.trim())
            }
          >
            <span>
              {loading
                ? "Analyzing project..."
                : "Analyze project"}
            </span>

            {!loading && <span>→</span>}
          </button>
        </form>
      ) : (
        <form
          onSubmit={handleFileSubmit}
          className={styles.form}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.txt,application/pdf,text/plain"
            className={styles.hiddenInput}
            onChange={handleFileChange}
          />

          <button
            type="button"
            className={`${styles.dropzone} ${
              file
                ? styles.dropzoneSelected
                : ""
            }`}
            onClick={() =>
              fileRef.current?.click()
            }
            onDragOver={(event) =>
              event.preventDefault()
            }
            onDrop={handleDrop}
          >
            <span
              className={
                styles.uploadIcon
              }
            >
              {file ? "✓" : "↑"}
            </span>

            <strong>
              {file
                ? file.name
                : "Drop your project document here"}
            </strong>

            <span className={styles.hint}>
              Click to browse or drag and drop
            </span>

            <span className={styles.fileTypes}>
              PDF or TXT · Maximum 10 MB
            </span>
          </button>

          {file && (
            <div className={styles.fileSelected}>
              <div>
                <strong>
                  Document selected
                </strong>

                <span>{file.name}</span>
              </div>

              <button
                type="button"
                className={styles.removeFile}
                onClick={handleRemoveFile}
              >
                Remove
              </button>
            </div>
          )}

          <button
            type="submit"
            className={styles.primaryButton}
            disabled={loading || !file}
          >
            <span>
              {loading
                ? "Analyzing document..."
                : "Analyze document"}
            </span>

            {!loading && <span>→</span>}
          </button>
        </form>
      )}

      <div className={styles.note}>
        <span>ⓘ</span>

        <p>
          AI suggestions are recommendations.
          Review the detected SDGs, evidence,
          tags, and project information before
          saving or publishing.
        </p>
      </div>
    </section>
  );
}

export default ClassifierForm;