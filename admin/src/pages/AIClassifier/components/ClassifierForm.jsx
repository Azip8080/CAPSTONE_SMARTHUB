
import { useRef, useState } from "react";
import styles from "./ClassifierForm.module.css";

function ClassifierForm({
  loading = false,
  onClassifyText,
  onClassifyFile,
}) {
  const [tab, setTab] = useState("text");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [formError, setFormError] = useState("");

  const fileRef = useRef(null);

  const validateFile = (selected) => {
    if (!selected) {
      setFormError("Please select a file.");
      return false;
    }

    const extension = selected.name
      .slice(selected.name.lastIndexOf("."))
      .toLowerCase();

    if (![".pdf", ".txt"].includes(extension)) {
      setFormError("Please select a PDF or TXT file.");
      return false;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setFormError("The maximum file size is 10 MB.");
      return false;
    }

    setFormError("");
    return true;
  };

  const handleTextSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!title.trim() && !description.trim()) {
      setFormError("Enter a title or description to analyze.");
      return;
    }

    if (typeof onClassifyText !== "function") {
      setFormError(
        "Text classification is not connected. Check AIClassifier.jsx."
      );
      console.error("onClassifyText is not a function.");
      return;
    }

    try {
      await onClassifyText(title, description);
    } catch (err) {
      setFormError(err.message || "Unable to analyze the text.");
    }
  };

  const handleFileSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!file) {
      setFormError("Please select a PDF or TXT file first.");
      return;
    }

    if (typeof onClassifyFile !== "function") {
      setFormError(
        "File classification is not connected. Check AIClassifier.jsx."
      );
      console.error("onClassifyFile is not a function.");
      return;
    }

    try {
      await onClassifyFile(file);
    } catch (err) {
      setFormError(err.message || "Unable to analyze the document.");
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

    if (loading) return;

    const dropped = event.dataTransfer.files?.[0];

    if (validateFile(dropped)) {
      setFile(dropped);

      if (fileRef.current) {
        fileRef.current.value = "";
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFormError("");

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  const openFilePicker = () => {
    if (!loading) {
      fileRef.current?.click();
    }
  };

  return (
    <section className={styles.card}>
      <div className={styles.heading}>
        <div className={styles.headingContent}>
          <span className={styles.eyebrow}>
            STEP 01 · CONTENT INPUT
          </span>

          <h2>Start an AI analysis</h2>

          <p>
            Enter project information or upload an existing document
            to identify relevant Sustainable Development Goals.
          </p>
        </div>

        <span className={styles.step}>01</span>
      </div>

      <div className={styles.tabs}>
        <button
          type="button"
          className={
            tab === "text" ? styles.activeTab : styles.tab
          }
          onClick={() => {
            setTab("text");
            setFormError("");
          }}
          disabled={loading}
        >
          <span className={styles.tabIcon}>✎</span>
          Text input
        </button>

        <button
          type="button"
          className={
            tab === "file" ? styles.activeTab : styles.tab
          }
          onClick={() => {
            setTab("file");
            setFormError("");
          }}
          disabled={loading}
        >
          <span className={styles.tabIcon}>↑</span>
          Upload document
        </button>
      </div>

      {tab === "text" ? (
        <form
          onSubmit={handleTextSubmit}
          className={styles.form}
        >
          <div className={styles.field}>
            <label htmlFor="classifier-title">
              Project title
            </label>

            <input
              id="classifier-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Community Tree Planting"
              maxLength={200}
              disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label htmlFor="classifier-description">
                Project description
              </label>

              <span className={styles.counter}>
                {description.length.toLocaleString()}/10,000
              </span>
            </div>

            <textarea
              id="classifier-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Describe the objectives, activities, beneficiaries, location, and expected impact..."
              rows={7}
              maxLength={10000}
              disabled={loading}
            />
          </div>

          {formError && (
            <p className={styles.error} role="alert">
              <span aria-hidden="true">!</span>
              {formError}
            </p>
          )}

          <button
            type="submit"
            className={styles.primaryButton}
            disabled={
              loading ||
              (!title.trim() && !description.trim())
            }
          >
            <span>
              {loading ? "Analyzing..." : "Analyze text"}
            </span>

            {!loading && <span aria-hidden="true">→</span>}
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
            disabled={loading}
            aria-label="Choose a PDF or TXT document"
          />

          <div
            className={`${styles.dropzone} ${
              file ? styles.dropzoneSelected : ""
            } ${loading ? styles.dropzoneDisabled : ""}`}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "copy";
            }}
            onDrop={handleDrop}
          >
            <button
              type="button"
              className={styles.uploadButton}
              onClick={openFilePicker}
              disabled={loading}
              aria-label={
                file
                  ? "Replace selected document"
                  : "Choose a document to upload"
              }
            >
              <span className={styles.uploadIcon}>
                {file ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="m5 12 4.5 4.5L19 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 16V4m0 0L7 9m5-5 5 5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 15v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </span>

              <strong className={styles.uploadTitle}>
                {file
                  ? "Document ready to analyze"
                  : "Drop your document here"}
              </strong>

              <span className={styles.hint}>
                {file
                  ? "Click here to choose a different file"
                  : "Click to browse or drag and drop your file"}
              </span>

              <span className={styles.fileTypes}>
                PDF or TXT <span>·</span> Maximum 10 MB
              </span>
            </button>
          </div>

          {file && (
            <div className={styles.fileSelected}>
              <div className={styles.fileIcon} aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M6 3.75h8l4 4V20a.75.75 0 0 1-.75.75h-10.5A.75.75 0 0 1 6 20V3.75Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 3.75v4.5h4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8.5 14h7m-7 3h5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className={styles.fileDetails}>
                <strong title={file.name}>{file.name}</strong>

                <span>
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                  <span className={styles.fileStatus}>
                    · Ready to analyze
                  </span>
                </span>
              </div>

              <button
                type="button"
                className={styles.removeFile}
                onClick={handleRemoveFile}
                disabled={loading}
                aria-label={`Remove ${file.name}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="m7 7 10 10M17 7 7 17"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                <span>Remove</span>
              </button>
            </div>
          )}

          {formError && (
            <p className={styles.error} role="alert">
              <span aria-hidden="true">!</span>
              {formError}
            </p>
          )}

          <button
            type="submit"
            className={styles.primaryButton}
            disabled={loading || !file}
          >
            <span>
              {loading ? "Analyzing document..." : "Analyze document"}
            </span>

            {!loading && <span aria-hidden="true">→</span>}
          </button>
        </form>
      )}

      <div className={styles.note}>
        <span className={styles.noteIcon} aria-hidden="true">
          i
        </span>

        <p>
          AI suggestions are recommendations. Review the detected
          SDGs and extracted information before saving or publishing.
        </p>
      </div>
    </section>
  );
}

export default ClassifierForm;
