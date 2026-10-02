
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

  // Validate uploaded files
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

  // Handle text submission
  const handleTextSubmit = (event) => {
    event.preventDefault();
    onClassifyText(title, description);
  };

  // Handle file submission
  const handleFileSubmit = (event) => {
    event.preventDefault();
    if (file) onClassifyFile(file);
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];

    if (validateFile(selected)) {
      setFile(selected);
    } else {
      setFile(null);
      event.target.value = "";
    }
  };

  // Handle drag-and-drop files
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
            CLASSIFICATION TOOL
          </span>
          <h2>Analyze a project</h2>
          <p>
            Enter project details or upload a document.
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
          ✎ Text input
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
          ▤ Upload file
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
            <label htmlFor="project-description">
              Project description
            </label>

            <textarea
              id="project-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Describe the project's objectives, activities, and expected impact..."
              rows={6}
              maxLength={10000}
            />

            <span className={styles.hint}>
              {description.length}/10,000 characters
            </span>
          </div>

          <button
            type="submit"
            className={styles.primaryButton}
            disabled={
              loading ||
              (!title.trim() && !description.trim())
            }
          >
            {loading
              ? "Analyzing..."
              : "Classify project"}

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
              file ? styles.dropzoneSelected : ""
            }`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(event) =>
              event.preventDefault()
            }
            onDrop={handleDrop}
          >
            <span className={styles.uploadIcon}>
              {file ? "✓" : "↑"}
            </span>

            <strong>
              {file
                ? file.name
                : "Choose a document to analyze"}
            </strong>

            <span className={styles.hint}>
              Click to browse or drag a file here
            </span>

            <span className={styles.fileTypes}>
              PDF or TXT · Maximum 10 MB
            </span>
          </button>

          {file && (
            <button
              type="button"
              className={styles.removeFile}
              onClick={handleRemoveFile}
            >
              Remove selected file
            </button>
          )}

          <button
            type="submit"
            className={styles.primaryButton}
            disabled={loading || !file}
          >
            {loading
              ? "Analyzing document..."
              : "Classify document"}

            {!loading && <span>→</span>}
          </button>
        </form>
      )}

      <div className={styles.note}>
        <span>ⓘ</span>

        <p>
          The classifier suggests an SDG category based on
          the submitted content. Review the suggestion
          before using it.
        </p>
      </div>
    </section>
  );
}

export default ClassifierForm;