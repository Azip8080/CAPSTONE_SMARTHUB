import { useState } from "react";
import {
  classifyText,
  classifyFile,
} from "../aiClassifierService";

const VALID_SDGS = Array.from(
  { length: 17 },
  (_, index) => `SDG ${index + 1}`
);

function normalizeSDG(value) {
  const text = String(value ?? "").trim();
  const match = text.match(/^SDG\s*(\d{1,2})$/i);

  if (!match) return "";

  const number = Number(match[1]);

  return number >= 1 && number <= 17
    ? `SDG ${number}`
    : "";
}

function normalizeTags(items) {
  if (!Array.isArray(items)) return [];

  return [
    ...new Set(
      items
        .map((item) =>
          typeof item === "string"
            ? item.trim()
            : String(item?.tag || item?.name || "").trim()
        )
        .filter(Boolean)
    ),
  ];
}

function useAIClassification() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sdgTag, setSdgTagState] = useState("");
  const [selectedSDGs, setSelectedSDGs] = useState([]);
  const [projectTags, setProjectTags] = useState([]);
  const [sourceFile, setSourceFile] = useState(null);
  const [qualityReport, setQualityReport] = useState(null);

  const setSdgTag = (value) => {
    const normalized = normalizeSDG(value);

    setSdgTagState(normalized);

    if (normalized) {
      setSelectedSDGs((current) =>
        current.includes(normalized)
          ? current
          : [...current, normalized]
      );
    }
  };

  const runClassification = async (request, details = {}) => {
    setLoading(true);
    setError("");
    setResult(null);
    setQualityReport(null);

    try {
      const data = await request();

      if (!data) {
        throw new Error("The classifier returned no results.");
      }

      setResult(data);

      const detectedTitle =
        details.title ||
        data.filename?.replace(/\.[^.]+$/, "") ||
        "";

      const primarySDG = normalizeSDG(
        data.sdgTag ?? data.tag ?? ""
      );

      const detectedSDGs = normalizeTags(
        Array.isArray(data.sdgTags)
          ? data.sdgTags
          : []
      )
        .map(normalizeSDG)
        .filter(Boolean);

      const allSDGs = [
        ...new Set([
          ...(primarySDG ? [primarySDG] : []),
          ...detectedSDGs,
        ]),
      ];

      setTitle(detectedTitle);
      setDescription(details.description || "");
      setSdgTagState(primarySDG);
      setSelectedSDGs(allSDGs);
      setProjectTags(
        normalizeTags(data.automaticTags || data.tags)
      );

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
    submittedTitle = "",
    submittedDescription = ""
  ) => {
    const cleanTitle = String(submittedTitle || "").trim();
    const cleanDescription = String(
      submittedDescription || ""
    ).trim();

    if (!cleanTitle && !cleanDescription) {
      setError("Enter text or a description to analyze.");
      return Promise.resolve(null);
    }

    setSourceFile(null);

    return runClassification(
      () => classifyText(cleanTitle, cleanDescription),
      {
        title: cleanTitle,
        description: cleanDescription,
      }
    );
  };

  const handleClassifyFile = (file) => {
    if (!file) {
      setError("Please select a PDF or TXT file.");
      return Promise.resolve(null);
    }

    const extension = file.name
      .split(".")
      .pop()
      .toLowerCase();

    const isPDF =
      extension === "pdf" &&
      file.type === "application/pdf";

    const isTXT =
      extension === "txt" &&
      (file.type === "text/plain" || file.type === "");

    if (!isPDF && !isTXT) {
      setError("Please select a valid PDF or TXT file.");
      return Promise.resolve(null);
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("The file must not exceed 10 MB.");
      return Promise.resolve(null);
    }

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
    const value = normalizeSDG(tag);

    if (!value) return;

    setSdgTag(value);

    if (typeof onResult === "function") {
      onResult(value);
    }
  };

  const handleToggleSDG = (tag) => {
    const value = normalizeSDG(tag);

    if (!value) return;

    setSelectedSDGs((current) => {
      if (current.includes(value)) {
        const updated = current.filter(
          (item) => item !== value
        );

        if (value === sdgTag) {
          const nextPrimary = updated[0] || "";
          setSdgTagState(nextPrimary);
        }

        return updated;
      }

      return [...current, value];
    });
  };

  const handleAddSDG = (tag) => {
    const value = normalizeSDG(tag);

    if (!value) return;

    setSelectedSDGs((current) =>
      current.includes(value)
        ? current
        : [...current, value]
    );
  };

  const handleRemoveSDG = (tag) => {
    const value = normalizeSDG(tag);

    if (!value) return;

    setSelectedSDGs((current) => {
      const updated = current.filter(
        (item) => item !== value
      );

      if (sdgTag === value) {
        setSdgTagState(updated[0] || "");
      }

      return updated;
    });
  };

  const handleToggleTag = (tag) => {
    const value = String(tag ?? "").trim();

    if (!value) return;

    setProjectTags((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  };

  const handleAddTag = (tag) => {
    const value = String(tag ?? "").trim();

    if (!value) return;

    setProjectTags((current) =>
      current.includes(value)
        ? current
        : [...current, value]
    );
  };

  const handleRemoveTag = (tag) => {
    setProjectTags((current) =>
      current.filter((item) => item !== tag)
    );
  };

  const runQualityCheck = ({
    barangay = "",
    status = "",
    requireDocument = false,
  } = {}) => {
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const primarySDG = normalizeSDG(sdgTag);
    const validStatus = [
      "Planned",
      "Ongoing",
      "Completed",
    ].includes(status);

    const validSelectedSDGs = selectedSDGs
      .map(normalizeSDG)
      .filter((tag) => VALID_SDGS.includes(tag));

    const checks = [
      {
        id: "title",
        label: "Project title",
        passed: cleanTitle.length >= 5,
        severity: "error",
        message:
          cleanTitle.length >= 5
            ? "A project title has been provided."
            : "Enter a descriptive title of at least 5 characters.",
      },
      {
        id: "description",
        label: "Project description",
        passed: cleanDescription.length >= 30,
        severity: "warning",
        message:
          cleanDescription.length >= 30
            ? "The description has enough text for an initial review."
            : "Add more detail about the project's purpose, activities, and beneficiaries.",
      },
      {
        id: "primarySDG",
        label: "Primary SDG",
        passed: VALID_SDGS.includes(primarySDG),
        severity: "error",
        message:
          VALID_SDGS.includes(primarySDG)
            ? `${primarySDG} is selected as the primary SDG.`
            : "Select a valid primary SDG from SDG 1 to SDG 17.",
      },
      {
        id: "selectedSDGs",
        label: "Selected SDGs",
        passed: validSelectedSDGs.length > 0,
        severity: "error",
        message:
          validSelectedSDGs.length > 0
            ? `${validSelectedSDGs.length} SDG(s) selected. Review their relevance to the project.`
            : "Select at least one relevant SDG.",
      },
      {
        id: "primaryIncluded",
        label: "Primary SDG consistency",
        passed:
          Boolean(primarySDG) &&
          validSelectedSDGs.includes(primarySDG),
        severity: "error",
        message:
          primarySDG &&
          validSelectedSDGs.includes(primarySDG)
            ? "The primary SDG is included in the selected SDGs."
            : "Ensure the primary SDG is also included in the selected SDGs.",
      },
      {
        id: "projectTags",
        label: "Suggested project tags",
        passed: projectTags.length > 0,
        severity: "warning",
        message:
          projectTags.length > 0
            ? `${projectTags.length} project keyword(s) available.`
            : "Consider adding useful project keywords.",
      },
      {
        id: "barangay",
        label: "Barangay or community",
        passed: String(barangay).trim().length > 0,
        severity: "error",
        message:
          String(barangay).trim().length > 0
            ? "The project location has been provided."
            : "Enter the barangay or community.",
      },
      {
        id: "status",
        label: "Project status",
        passed: validStatus,
        severity: "error",
        message:
          validStatus
            ? "A valid project status is selected."
            : "Select Planned, Ongoing, or Completed.",
      },
      {
        id: "document",
        label: "Project document",
        passed: Boolean(sourceFile),
        severity: requireDocument ? "error" : "warning",
        message: sourceFile
          ? "A document is attached for this session."
          : requireDocument
            ? "Upload the required project document."
            : "No document is attached. Check whether one is required.",
      },
    ];

    const passedCount = checks.filter(
      (check) => check.passed
    ).length;

    const failedChecks = checks.filter(
      (check) => !check.passed
    );

    const errorCount = failedChecks.filter(
      (check) => check.severity === "error"
    ).length;

    const warningCount = failedChecks.filter(
      (check) => check.severity === "warning"
    ).length;

    const report = {
      checks,
      passedCount,
      totalChecks: checks.length,
      errorCount,
      warningCount,
      hasErrors: errorCount > 0,
      isComplete: failedChecks.length === 0,
      checkedAt: new Date().toISOString(),
    };

    setQualityReport(report);

    return report;
  };

  const resetQualityCheck = () => {
    setQualityReport(null);
  };

  const resetClassification = () => {
    setResult(null);
    setLoading(false);
    setError("");
    setTitle("");
    setDescription("");
    setSdgTagState("");
    setSelectedSDGs([]);
    setProjectTags([]);
    setSourceFile(null);
    setQualityReport(null);
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
    sourceFile,
    qualityReport,
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
    runQualityCheck,
    resetQualityCheck,
    resetClassification,
  };
}

export default useAIClassification;
