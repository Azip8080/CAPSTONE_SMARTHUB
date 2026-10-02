const REQUIRED_INFO = [
  {
    key: "beneficiaries",
    label: "Target beneficiaries",
    keywords: [
      "beneficiaries",
      "residents",
      "families",
      "students",
      "farmers",
      "women",
      "children",
      "youth",
      "elderly",
      "pwd",
      "persons with disabilities",
      "low-income",
      "community members",
    ],
  },
  {
    key: "activities",
    label: "Project activities",
    keywords: [
      "program",
      "project",
      "training",
      "workshop",
      "seminar",
      "distribution",
      "assistance",
      "construction",
      "implementation",
      "conduct",
      "provide",
      "establish",
      "develop",
    ],
  },
  {
    key: "outcomes",
    label: "Expected outcomes",
    keywords: [
      "outcome",
      "result",
      "improve",
      "increase",
      "reduce",
      "provide",
      "create",
      "strengthen",
      "help",
      "benefit",
    ],
  },
  {
    key: "timeline",
    label: "Implementation timeline",
    keywords: [
      "month",
      "months",
      "week",
      "weeks",
      "year",
      "years",
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
      "deadline",
      "schedule",
      "duration",
    ],
  },
  {
    key: "location",
    label: "Project location",
    keywords: [
      "barangay",
      "city",
      "municipality",
      "community",
      "school",
      "district",
      "location",
      "site",
    ],
  },
];

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function containsKeyword(text, keywords) {
  return keywords.some((keyword) =>
    text.includes(keyword)
  );
}

function detectMissingInformation(text) {
  const normalizedText = normalizeText(text);

  const missing = REQUIRED_INFO
    .filter(
      (item) =>
        !containsKeyword(
          normalizedText,
          item.keywords
        )
    )
    .map((item) => ({
      key: item.key,
      label: item.label,
    }));

  return {
    missing,
    missingCount: missing.length,
    complete: missing.length === 0,
  };
}

module.exports = {
  detectMissingInformation,
};