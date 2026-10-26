import { useState } from "react";
import {
  classifyText,
  classifyFile,
} from "../aiClassifierService";

function useAIClassification() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sdgTag, setSdgTag] = useState("");
  const [selectedSDGs, setSelectedSDGs] = useState([]);
  const [projectTags, setProjectTags] = useState([]);

  // Keep the original uploaded file so it can also
  // be permanently saved with the selected destination.
  const [sourceFile, setSourceFile] = useState(null);

  const runClassification = async (request, details = {}) => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await request();

      if (!data) {
        throw new Error("The classifier returned no results.");
      }

      setResult(data);

      setTitle(
        details.title ||
          data.filename?.replace(/\.[^.]+$/, "") ||
          ""
      );

      setDescription(details.description || "");

      const primarySDG = data.sdgTag ?? data.tag ?? "";

      const detectedSDGs = Array.isArray(data.sdgTags)
        ? data.sdgTags
        : primarySDG
          ? [primarySDG]
          : [];

      setSdgTag(String(primarySDG));

      setSelectedSDGs(
        [...new Set(detectedSDGs.map(String))]
      );

      const tags = Array.isArray(data.automaticTags)
        ? data.automaticTags
            .map((item) =>
              typeof item === "string"
                ? item
                : item?.tag || item?.name
            )
            .filter(Boolean)
        : [];

      setProjectTags(tags);

      return data;
    } catch (err) {
      setResult(null);

      setError(
        err?.message || "Unable to classify this content."
      );

      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleClassifyText = (
    submittedTitle,
    submittedDescription
  ) => {
    // Text classification does not have an uploaded file.
    setSourceFile(null);

    if (
      !submittedTitle?.trim() &&
      !submittedDescription?.trim()
    ) {
      setError("Enter a title or description to analyze.");
      return Promise.resolve(null);
    }

    return runClassification(
      () =>
        classifyText(
          submittedTitle.trim(),
          submittedDescription.trim()
        ),
      {
        title: submittedTitle.trim(),
        description: submittedDescription.trim(),
      }
    );
  };

  const handleClassifyFile = (file) => {
    if (!file) {
      setError("Please select a PDF or TXT file.");
      return Promise.resolve(null);
    }

    // IMPORTANT:
    // Keep the actual File object after AI classification.
    setSourceFile(file);

    return runClassification(
      () => classifyFile(file),
      {
        title: file.name.replace(/\.[^.]+$/, ""),
        description: "",
      }
    );
  };

  const handleUseResult = (tag, onResult) => {
    setSdgTag(String(tag));

    setSelectedSDGs((currentSDGs) =>
      currentSDGs.includes(String(tag))
        ? currentSDGs
        : [...currentSDGs, String(tag)]
    );

    if (typeof onResult === "function") {
      onResult(tag);
    }
  };

  const handleToggleSDG = (tag) => {
    const value = String(tag);

    setSelectedSDGs((currentSDGs) =>
      currentSDGs.includes(value)
        ? currentSDGs.filter((item) => item !== value)
        : [...currentSDGs, value]
    );
  };

  const handleAddSDG = (tag) => {
    const value = String(tag ?? "").trim();

    if (!value) {
      return;
    }

    setSelectedSDGs((currentSDGs) =>
      currentSDGs.includes(value)
        ? currentSDGs
        : [...currentSDGs, value]
    );
  };

  const handleRemoveSDG = (tag) => {
    const value = String(tag);

    setSelectedSDGs((currentSDGs) =>
      currentSDGs.filter((item) => item !== value)
    );
  };

  const handleToggleTag = (tag) => {
    setProjectTags((currentTags) =>
      currentTags.includes(tag)
        ? currentTags.filter((item) => item !== tag)
        : [...currentTags, tag]
    );
  };

  const handleAddTag = (tag) => {
    const value = String(tag ?? "").trim();

    if (!value) {
      return;
    }

    setProjectTags((currentTags) =>
      currentTags.includes(value)
        ? currentTags
        : [...currentTags, value]
    );
  };

  const handleRemoveTag = (tag) => {
    setProjectTags((currentTags) =>
      currentTags.filter((item) => item !== tag)
    );
  };

  const resetClassification = () => {
    setResult(null);
    setLoading(false);
    setError("");
    setTitle("");
    setDescription("");
    setSdgTag("");
    setSelectedSDGs([]);
    setProjectTags([]);
    setSourceFile(null);
  };

  return {
    result,
    loading,
    error,

    title,
    description,
    sdgTag,
    selectedSDGs,
    projectTags,

    // The original uploaded PDF/TXT file.
    sourceFile,

    setTitle,
    setDescription,
    setSdgTag,
    setSelectedSDGs,
    setProjectTags,

    runClassification,
    handleClassifyText,
    handleClassifyFile,

    handleUseResult,

    handleToggleSDG,
    handleAddSDG,
    handleRemoveSDG,

    handleToggleTag,
    handleAddTag,
    handleRemoveTag,

    resetClassification,
  };
}

export default useAIClassification;