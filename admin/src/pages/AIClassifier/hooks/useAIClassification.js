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

  const runClassification = async (
    request,
    details = {}
  ) => {
    setLoading(true);
    setError("");
    setResult(null);
    setSelectedSDGs([]);
    setProjectTags([]);

    try {
      const data = await request();

      setResult(data);

      setTitle(
        details.title ||
          data.filename?.replace(
            /\.[^.]+$/,
            ""
          ) ||
          ""
      );

      setDescription(
        details.description || ""
      );

      const primarySDG =
        data.tag ||
        data.sdgTag ||
        "";

      const detectedSDGs =
        Array.isArray(data.sdgTags)
          ? data.sdgTags
          : primarySDG
            ? [primarySDG]
            : [];

      setSdgTag(primarySDG);
      setSelectedSDGs(
        detectedSDGs
      );

      setProjectTags(
        Array.isArray(
          data.automaticTags
        )
          ? data.automaticTags
              .map(
                (item) =>
                  item.tag ||
                  item.name
              )
              .filter(Boolean)
          : []
      );

      return data;
    } catch (err) {
      setError(
        err.message ||
          "Unable to classify this content."
      );

      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleClassifyText = (
    submittedTitle,
    submittedDescription
  ) =>
    runClassification(
      () =>
        classifyText(
          submittedTitle,
          submittedDescription
        ),
      {
        title: submittedTitle,
        description:
          submittedDescription,
      }
    );

  const handleClassifyFile = (
    file
  ) =>
    runClassification(
      () => classifyFile(file),
      {
        title: file.name.replace(
          /\.[^.]+$/,
          ""
        ),
        description: "",
      }
    );

  const handleUseResult = (
    tag,
    onResult
  ) => {
    setSdgTag(tag);

    setSelectedSDGs(
      (currentSDGs) =>
        currentSDGs.includes(tag)
          ? currentSDGs
          : [...currentSDGs, tag]
    );

    if (onResult) {
      onResult(tag);
    }
  };

  const handleToggleSDG = (
    tag
  ) => {
    setSelectedSDGs(
      (currentSDGs) =>
        currentSDGs.includes(tag)
          ? currentSDGs.filter(
              (item) =>
                item !== tag
            )
          : [...currentSDGs, tag]
    );
  };

  const handleAddSDG = (
    tag
  ) => {
    const trimmedTag =
      tag.trim();

    if (!trimmedTag) return;

    setSelectedSDGs(
      (currentSDGs) =>
        currentSDGs.includes(
          trimmedTag
        )
          ? currentSDGs
          : [
              ...currentSDGs,
              trimmedTag,
            ]
    );
  };

  const handleRemoveSDG = (
    tag
  ) => {
    setSelectedSDGs(
      (currentSDGs) =>
        currentSDGs.filter(
          (item) =>
            item !== tag
        )
    );
  };

  const handleToggleTag = (
    tag
  ) => {
    setProjectTags(
      (currentTags) =>
        currentTags.includes(tag)
          ? currentTags.filter(
              (item) =>
                item !== tag
            )
          : [
              ...currentTags,
              tag,
            ]
    );
  };

  const handleAddTag = (
    tag
  ) => {
    const trimmedTag =
      tag.trim();

    if (!trimmedTag) return;

    setProjectTags(
      (currentTags) =>
        currentTags.includes(
          trimmedTag
        )
          ? currentTags
          : [
              ...currentTags,
              trimmedTag,
            ]
    );
  };

  const handleRemoveTag = (
    tag
  ) => {
    setProjectTags(
      (currentTags) =>
        currentTags.filter(
          (item) =>
            item !== tag
        )
    );
  };

  const resetClassification = () => {
    setResult(null);
    setError("");
    setTitle("");
    setDescription("");
    setSdgTag("");
    setSelectedSDGs([]);
    setProjectTags([]);
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
    setTitle,
    setDescription,
    setSdgTag,
    setSelectedSDGs,
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