import { useMemo, useState } from "react";

import SDGRelevance from "./SDGRelevance";
import DetectedSDGs from "./DetectedSDGs";
import ProjectSummary from "./ProjectSummary";

import {
  SDG_COLORS,
  SDG_NAMES,
} from "../sdgConstants";

import styles from "./ClassificationResult.module.css";

import ClassificationSummary from "./ClassificationSummary";
import EvidenceSection from "./EvidenceSection";
import OtherSDGs from "./OtherSDGs";
import SuggestedTags from "./SuggestedTags";
import ExtractedText from "./ExtractedText";
import MissingInformation from "./MissingInformation";

function getSDGName(tag) {
  return (
    SDG_NAMES?.[tag] ||
    tag ||
    "Unknown SDG"
  );
}

function getSDGColor(tag) {
  return (
    SDG_COLORS?.[tag] ||
    "#64748b"
  );
}

function ClassificationResult({
  result,
  loading,
  error,
  onUseResult,
  onReset,
  selectedSDGs = [],
  onToggleSDG,
  selectedTags = [],
  onToggleTag,
  onAddTag,
  onRemoveTag,
}) {
  const [activeTab, setActiveTab] =
    useState("evidence");

  const classificationData =
    useMemo(() => {
      if (!result) return null;

      const primaryTag =
        result.tag ||
        result.sdgTag ||
        "Unknown SDG";

      const detectedSDGs =
        Array.isArray(result.sdgTags)
          ? result.sdgTags
          : primaryTag !== "Unknown SDG"
            ? [primaryTag]
            : [];

      const alternatives =
        Array.isArray(
          result.topMatches
        )
          ? result.topMatches.filter(
              (item) =>
                item &&
                (
                  item.tag ||
                  item.label ||
                  item.name
                )
            )
          : [];

      const relatedSDGs =
        Array.isArray(
          result.relatedSDGs
        )
          ? result.relatedSDGs.filter(
              (item) =>
                item &&
                (
                  item.tag ||
                  item.label ||
                  item.name
                )
            )
          : [];

      const automaticTags =
        Array.isArray(
          result.automaticTags
        )
          ? result.automaticTags.filter(
              (item) =>
                item &&
                (
                  item.tag ||
                  item.name
                )
            )
          : [];

      const missingInformation =
        result.missingInformation ||
        null;

      const sdgRelevance =
        Array.isArray(
          result.sdgRelevance
        )
          ? result.sdgRelevance
          : [];

      const projectSummary =
        typeof result.projectSummary ===
        "string"
          ? result.projectSummary
          : "";

      const keywordData =
        result.keywordMatches ||
        {};

      const groupedKeywords =
        keywordData.grouped ||
        {};

      const evidenceBySDG =
        keywordData.evidenceBySDG ||
        {};

      const keywordGroups =
        Object.entries(
          groupedKeywords
        )
          .filter(
            ([, matches]) =>
              Array.isArray(matches) &&
              matches.length > 0
          )
          .sort(
            ([, a], [, b]) =>
              b.length - a.length
          );

      const allMatches =
        Array.isArray(
          keywordData.matches
        )
          ? keywordData.matches
          : [];

      const extractedText =
        typeof result.extractedText ===
        "string"
          ? result.extractedText
          : "";

      const totalMatches =
        typeof keywordData.totalMatches ===
        "number"
          ? keywordData.totalMatches
          : allMatches.length;

      const methodLabel =
        result.method ===
        "huggingface"
          ? "AI model"
          : result.method ===
              "keyword"
            ? "Keyword matching"
            : result.method ||
              "Classification";

      return {
        primaryTag,
        primaryName:
          getSDGName(primaryTag),
        primaryColor:
          getSDGColor(primaryTag),
        detectedSDGs,
        alternatives,
        relatedSDGs,
        automaticTags,
        missingInformation,
        sdgRelevance,
        projectSummary,
        groupedKeywords,
        evidenceBySDG,
        keywordGroups,
        allMatches,
        extractedText,
        totalMatches,
        methodLabel,
      };
    }, [result]);

  if (loading) {
    return (
      <section
        className={styles.resultCard}
        aria-live="polite"
      >
        <div
          className={
            styles.loadingState
          }
        >
          <div
            className={styles.spinner}
          />

          <h3>
            Analyzing document...
          </h3>

          <p>
            Extracting text and
            checking possible SDG
            connections.
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        className={styles.resultCard}
        role="alert"
      >
        <div
          className={styles.errorState}
        >
          <h3>
            Classification failed
          </h3>

          <p>{error}</p>

          {onReset && (
            <button
              type="button"
              className={
                styles.secondaryButton
              }
              onClick={onReset}
            >
              Try again
            </button>
          )}
        </div>
      </section>
    );
  }

  if (
    !result ||
    !classificationData
  ) {
    return (
      <section
        className={styles.resultCard}
      >
        <div
          className={styles.emptyState}
        >
          <h3>
            Classification results
          </h3>

          <p>
            Submit a project title,
            description, or PDF/TXT
            file to see its suggested
            SDG and supporting
            evidence.
          </p>
        </div>
      </section>
    );
  }

  const {
    primaryTag,
    primaryName,
    primaryColor,
    detectedSDGs,
    alternatives,
    relatedSDGs,
    automaticTags,
    missingInformation,
    sdgRelevance,
    projectSummary,
    evidenceBySDG,
    keywordGroups,
    allMatches,
    extractedText,
    totalMatches,
    methodLabel,
  } = classificationData;

  const missingCount =
    missingInformation?.missingCount ||
    0;

  const tabs = [
    {
      id: "evidence",
      label: "Evidence",
      count: totalMatches,
    },
    {
      id: "alternatives",
      label: "Other SDGs",
      count:
        relatedSDGs.length ||
        alternatives.length,
    },
    {
      id: "tags",
      label: "Suggested Tags",
      count: automaticTags.length,
    },
    {
      id: "missing",
      label: "Missing Information",
      count: missingCount,
    },
    {
      id: "relevance",
      label: "SDG Relevance",
      count: sdgRelevance.length,
    },
    {
      id: "text",
      label: "Extracted text",
      count: extractedText
        ? null
        : 0,
    },
  ];

  return (
    <section
      className={styles.resultCard}
      aria-live="polite"
    >
      <header
        className={styles.resultHeader}
      >
        <div
          className={
            styles.headingContent
          }
        >
          <p
            className={styles.eyebrow}
          >
            <span
              className={
                styles.statusDot
              }
            />

            Analysis complete
          </p>

          <h2>
            Classification results
          </h2>

          <p
            className={
              styles.resultDescription
            }
          >
            Review the suggested SDGs
            before saving or publishing
            the project.
          </p>
        </div>

        {result.filename && (
          <span
            className={styles.fileBadge}
            title={result.filename}
          >
            <span aria-hidden="true">
              ▤
            </span>

            <span>
              {result.filename}
            </span>
          </span>
        )}
      </header>

      <ClassificationSummary
        primaryTag={primaryTag}
        primaryName={primaryName}
        primaryColor={primaryColor}
        methodLabel={methodLabel}
        result={result}
        totalMatches={totalMatches}
        keywordGroupsLength={
          keywordGroups.length
        }
        relatedSDGsLength={
          relatedSDGs.length
        }
        selectedTagsLength={
          selectedTags.length
        }
        extractedText={
          extractedText
        }
        onUseResult={
          onUseResult
        }
      />

      <DetectedSDGs
        sdgTags={detectedSDGs}
        selectedSDGs={selectedSDGs}
        onToggleSDG={onToggleSDG}
      />

      <div
        className={styles.tabSection}
      >
        <div
          className={styles.tabHeader}
          role="tablist"
          aria-label="Analysis details"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={
                activeTab ===
                tab.id
              }
              aria-controls={`panel-${tab.id}`}
              className={`
                ${styles.tabButton}
                ${
                  activeTab ===
                  tab.id
                    ? styles.activeTab
                    : ""
                }
              `}
              onClick={() =>
                setActiveTab(
                  tab.id
                )
              }
            >
              {tab.label}

              {tab.count !==
                null && (
                <span
                  className={
                    styles.tabCount
                  }
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab ===
          "evidence" && (
          <EvidenceSection
            keywordGroups={
              keywordGroups
            }
            evidenceBySDG={
              evidenceBySDG
            }
            totalMatches={
              totalMatches
            }
          />
        )}

        {activeTab ===
          "alternatives" && (
          <OtherSDGs
            relatedSDGs={
              relatedSDGs
            }
            alternatives={
              alternatives
            }
            primaryTag={
              primaryTag
            }
            onUseResult={
              onUseResult
            }
          />
        )}

        {activeTab === "tags" && (
          <SuggestedTags
            automaticTags={
              automaticTags
            }
            selectedTags={
              selectedTags
            }
            primaryColor={
              primaryColor
            }
            onToggleTag={
              onToggleTag
            }
            onAddTag={onAddTag}
            onRemoveTag={
              onRemoveTag
            }
          />
        )}

        {activeTab ===
          "missing" && (
          <MissingInformation
            missingInformation={
              missingInformation
            }
          />
        )}

        {activeTab ===
          "relevance" && (
          <SDGRelevance
            sdgRelevance={
              sdgRelevance
            }
          />
        )}

        {activeTab === "text" && (
          <ExtractedText
            extractedText={
              extractedText
            }
            allMatches={
              allMatches
            }
          />
        )}
      </div>

      <ProjectSummary
        summary={projectSummary}
      />

      <div
        className={
          styles.reviewNotice
        }
      >
        <span
          className={
            styles.reviewIcon
          }
        >
          !
        </span>

        <div>
          <strong>
            Administrator review
            required
          </strong>

          <p>
            Confirm the project's
            actual objectives and
            select the appropriate
            SDGs before saving or
            publishing it.
          </p>
        </div>
      </div>

      {onReset && (
        <div
          className={
            styles.resultActions
          }
        >
          <button
            type="button"
            className={
              styles.secondaryButton
            }
            onClick={onReset}
          >
            Classify another project
          </button>
        </div>
      )}
    </section>
  );
}

export default ClassificationResult;