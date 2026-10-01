import { useState } from "react";
import ClassifierForm from "./ClassifierForm";
import ClassificationResult from "./ClassificationResult";
import { classifyText, classifyFile } from "./aiClassifierService";
import styles from "./AIClassifier.module.css";

function AIClassifier({ onResult }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runClassification = async (request) => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await request();
      setResult(data);
    } catch (err) {
      setError(err.message || "Unable to classify this content.");
    } finally {
      setLoading(false);
    }
  };

  const handleClassifyText = (title, description) =>
    runClassification(() => classifyText(title, description));

  const handleClassifyFile = (file) =>
    runClassification(() => classifyFile(file));

  const handleReset = () => {
    setResult(null);
    setError("");
  };

  const handleUseResult = (tag) => {
    if (onResult) {
      onResult(tag);
    }
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
            Identify which Sustainable Development Goal best
            relates to a project using NLP classification.
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
            Analyze a project description or document, review the
            suggested SDG, and check other possible matches before
            using the result.
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
          onUseResult={onResult ? handleUseResult : null}
          onReset={handleReset}
        />
      </div>

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