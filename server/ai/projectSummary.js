const SUMMARY_LIMIT = 4000;

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "of",
  "to",
  "in",
  "for",
  "on",
  "with",
  "from",
  "by",
  "this",
  "that",
  "is",
  "are",
  "will",
  "be",
  "as",
  "at",
  "it",
  "its",
  "their",
  "they",
  "through",
  "into",
  "also",
]);

const PROJECT_TERMS = [
  "project",
  "program",
  "proposal",
  "initiative",
  "community",
  "center",
  "development",
  "activity",
  "service",
];

const ACTIVITY_TERMS = [
  "provide",
  "provides",
  "providing",
  "offer",
  "offers",
  "offering",
  "organize",
  "organizes",
  "organizing",
  "conduct",
  "conducts",
  "conducting",
  "collect",
  "distribution",
  "distribute",
  "training",
  "tutoring",
  "workshop",
  "seminar",
  "education",
  "assistance",
  "support",
  "access",
  "establish",
  "develop",
  "development",
  "consultation",
  "vaccination",
  "nutrition",
  "livelihood",
  "install",
  "installing",
  "monitor",
  "monitoring",
  "train",
  "training",
  "encourage",
];

const BENEFICIARY_TERMS = [
  "children",
  "students",
  "families",
  "households",
  "residents",
  "farmers",
  "women",
  "youth",
  "elderly",
  "older residents",
  "pwd",
  "persons with disabilities",
  "community members",
  "workers",
  "unemployed",
  "low-income",
  "disadvantaged",
  "adults",
  "young people",
];

const OUTCOME_TERMS = [
  "aims to",
  "aim to",
  "goal",
  "goals",
  "objective",
  "objectives",
  "improve",
  "increase",
  "reduce",
  "strengthen",
  "promote",
  "support",
  "help",
  "benefit",
  "enhance",
  "provide opportunities",
  "lower",
  "prevent",
  "encourage",
];

const EXCLUDE_TERMS = [
  "purpose of this document",
  "designed to test",
  "test the sdg",
  "ai-powered document",
  "administrator's ai",
  "sample document",
  "this sample",
  "test document",
  "classification feature",
  "likely related goals",
  "for testing",
];

function normalizeText(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(
      (sentence) =>
        sentence.length >= 20
    );
}

function getWords(text) {
  return text
    .toLowerCase()
    .split(/\s+/)
    .map((word) =>
      word.replace(
        /[^a-z0-9-]/g,
        ""
      )
    )
    .filter(
      (word) =>
        word.length > 2 &&
        !STOP_WORDS.has(word)
    );
}

function getImportantWords(text) {
  const words =
    getWords(text);

  const counts = {};

  for (const word of words) {
    counts[word] =
      (counts[word] || 0) + 1;
  }

  return Object.entries(counts)
    .sort(
      (a, b) =>
        b[1] - a[1]
    )
    .slice(0, 30)
    .map(([word]) => word);
}

function countMatches(
  sentence,
  terms
) {
  const normalized =
    sentence.toLowerCase();

  return terms.reduce(
    (count, term) =>
      normalized.includes(term)
        ? count + 1
        : count,
    0
  );
}

function hasExcludedContent(
  sentence
) {
  const normalized =
    sentence.toLowerCase();

  return EXCLUDE_TERMS.some(
    (term) =>
      normalized.includes(term)
  );
}

function isLikelyHeading(
  sentence
) {
  const words =
    sentence.split(/\s+/);

  if (
    words.length < 2 ||
    words.length > 12
  ) {
    return false;
  }

  if (
    /[.!?]$/.test(sentence)
  ) {
    return false;
  }

  if (
    hasExcludedContent(
      sentence
    )
  ) {
    return false;
  }

  const normalized =
    sentence.toLowerCase();

  const hasProjectTerm =
    PROJECT_TERMS.some(
      (term) =>
        normalized.includes(term)
    );

  const hasActivity =
    ACTIVITY_TERMS.some(
      (term) =>
        normalized.includes(term)
    );

  const hasBeneficiary =
    BENEFICIARY_TERMS.some(
      (term) =>
        normalized.includes(term)
    );

  const hasOutcome =
    OUTCOME_TERMS.some(
      (term) =>
        normalized.includes(term)
    );

  if (
    hasActivity ||
    hasBeneficiary ||
    hasOutcome
  ) {
    return false;
  }

  return (
    hasProjectTerm ||
    /^[A-Z0-9][A-Za-z0-9\s&-]+$/.test(
      sentence
    )
  );
}

function cleanHeading(
  heading
) {
  return heading
    .replace(
      /^project proposal:\s*/i,
      ""
    )
    .replace(
      /^project description:\s*/i,
      ""
    )
    .replace(
      /--\s*\d+\s+of\s+\d+\s*--/gi,
      ""
    )
    .trim();
}

function cleanSentence(
  sentence
) {
  return sentence
    .replace(
      /^project proposal:\s*/i,
      ""
    )
    .replace(
      /^project description:\s*/i,
      ""
    )
    .replace(
      /--\s*\d+\s+of\s+\d+\s*--/gi,
      ""
    )
    .trim();
}

function scoreSentence(
  sentence,
  importantWords
) {
  if (
    hasExcludedContent(
      sentence
    )
  ) {
    return -100;
  }

  const normalized =
    sentence.toLowerCase();

  let score = 0;

  score +=
    countMatches(
      normalized,
      ACTIVITY_TERMS
    ) * 3;

  score +=
    countMatches(
      normalized,
      BENEFICIARY_TERMS
    ) * 3;

  score +=
    countMatches(
      normalized,
      OUTCOME_TERMS
    ) * 3;

  score +=
    countMatches(
      normalized,
      PROJECT_TERMS
    );

  for (const word of importantWords) {
    if (
      normalized.includes(
        ` ${word} `
      )
    ) {
      score += 1;
    }
  }

  return score;
}

function removeDuplicateSentences(
  sentences
) {
  const seen = new Set();

  return sentences.filter(
    (sentence) => {
      const normalized =
        sentence
          .toLowerCase()
          .replace(
            /[^a-z0-9\s]/g,
            ""
          )
          .trim();

      if (
        seen.has(normalized)
      ) {
        return false;
      }

      seen.add(normalized);

      return true;
    }
  );
}

function limitSummary(text) {
  if (
    text.length <=
    SUMMARY_LIMIT
  ) {
    return text;
  }

  return (
    text
      .slice(
        0,
        SUMMARY_LIMIT
      )
      .replace(
        /\s+\S*$/,
        ""
      )
      .trim() +
    "..."
  );
}

function buildSections(
  sentences
) {
  const sections = [];
  let current = null;

  for (const sentence of sentences) {
    if (
      isLikelyHeading(
        sentence
      )
    ) {
      current = {
        title:
          cleanHeading(
            sentence
          ),
        sentences: [],
      };

      sections.push(current);

      continue;
    }

    if (
      hasExcludedContent(
        sentence
      )
    ) {
      continue;
    }

    if (current) {
      current.sentences.push(
        sentence
      );
    }
  }

  return sections.filter(
    (section) =>
      section.sentences.length > 0
  );
}

function summarizeSection(
  section,
  importantWords
) {
  const scored =
    section.sentences
      .map(
        (
          sentence,
          index
        ) => ({
          sentence,
          index,
          score:
            scoreSentence(
              sentence,
              importantWords
            ),
        })
      )
      .filter(
        (item) =>
          item.score > 0
      )
      .sort(
        (a, b) => {
          if (
            b.score !==
            a.score
          ) {
            return (
              b.score -
              a.score
            );
          }

          return (
            a.index -
            b.index
          );
        }
      );

  const selected =
    scored.slice(0, 4);

  selected.sort(
    (a, b) =>
      a.index - b.index
  );

  const sentences =
    removeDuplicateSentences(
      selected.map(
        (item) =>
          cleanSentence(
            item.sentence
          )
      )
    );

  if (!sentences.length) {
    return "";
  }

  return `${section.title}: ${sentences.join(
    " "
  )}`;
}

function generateProjectSummary(
  text
) {
  const normalizedText =
    normalizeText(text);

  if (!normalizedText) {
    return "";
  }

  const sentences =
    splitSentences(
      normalizedText
    );

  if (!sentences.length) {
    return normalizedText;
  }

  const importantWords =
    getImportantWords(
      normalizedText
    );

  const sections =
    buildSections(
      sentences
    );

  if (sections.length) {
    const sectionSummaries =
      sections
        .map(
          (section) =>
            summarizeSection(
              section,
              importantWords
            )
        )
        .filter(Boolean);

    if (
      sectionSummaries.length
    ) {
      return limitSummary(
        sectionSummaries.join(
          " "
        )
      );
    }
  }

  const fallback =
    sentences
      .map(
        (
          sentence,
          index
        ) => ({
          sentence,
          index,
          score:
            scoreSentence(
              sentence,
              importantWords
            ),
        })
      )
      .filter(
        (item) =>
          item.score > 0
      )
      .sort(
        (a, b) => {
          if (
            b.score !==
            a.score
          ) {
            return (
              b.score -
              a.score
            );
          }

          return (
            a.index -
            b.index
          );
        }
      )
      .slice(0, 10)
      .sort(
        (a, b) =>
          a.index - b.index
      )
      .map(
        (item) =>
          cleanSentence(
            item.sentence
          )
      );

  const unique =
    removeDuplicateSentences(
      fallback
    );

  return limitSummary(
    unique.join(" ")
  );
}

module.exports = {
  generateProjectSummary,
};