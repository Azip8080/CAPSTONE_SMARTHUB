const SDG_NAMES = {
  "SDG 1": "No Poverty",
  "SDG 2": "Zero Hunger",
  "SDG 3": "Good Health and Well-Being",
  "SDG 4": "Quality Education",
  "SDG 5": "Gender Equality",
  "SDG 6": "Clean Water and Sanitation",
  "SDG 7": "Affordable and Clean Energy",
  "SDG 8": "Decent Work and Economic Growth",
  "SDG 9": "Industry Innovation and Infrastructure",
  "SDG 10": "Reduced Inequalities",
  "SDG 11": "Sustainable Cities and Communities",
  "SDG 12": "Responsible Consumption and Production",
  "SDG 13": "Climate Action",
  "SDG 14": "Life Below Water",
  "SDG 15": "Life on Land",
  "SDG 16": "Peace Justice and Strong Institutions",
  "SDG 17": "Partnerships for the Goals",
};

const SDG_EXPLANATIONS = {
  "SDG 1": {
    keywords: [
      "poverty",
      "low-income",
      "livelihood",
      "income",
      "financial assistance",
      "employment",
      "cash assistance",
      "economic support",
    ],
    explanation:
      "The project supports poverty reduction by improving income opportunities, providing financial assistance, or supporting economically vulnerable community members.",
  },

  "SDG 2": {
    keywords: [
      "hunger",
      "food",
      "nutrition",
      "farmer",
      "farming",
      "agriculture",
      "crop",
      "feeding",
      "food assistance",
    ],
    explanation:
      "The project supports food security and nutrition through food assistance, agricultural activities, or programs that improve access to adequate food.",
  },

  "SDG 3": {
    keywords: [
      "health",
      "medical",
      "hospital",
      "clinic",
      "vaccination",
      "medicine",
      "mental health",
      "well-being",
      "healthcare",
    ],
    explanation:
      "The project contributes to health and well-being by improving access to healthcare, medical assistance, preventive services, or health-related support.",
  },

  "SDG 4": {
    keywords: [
      "education",
      "school",
      "student",
      "training",
      "scholarship",
      "learning",
      "skills",
      "literacy",
      "workshop",
      "seminar",
    ],
    explanation:
      "The project supports quality education by providing learning opportunities, training, scholarships, skills development, or educational resources.",
  },

  "SDG 5": {
    keywords: [
      "gender",
      "women",
      "women empowerment",
      "girls",
      "female",
      "equality",
      "women's",
    ],
    explanation:
      "The project supports gender equality by promoting equal opportunities, women's empowerment, or programs addressing the needs of women and girls.",
  },

  "SDG 6": {
    keywords: [
      "water",
      "sanitation",
      "clean water",
      "drinking water",
      "toilet",
      "wastewater",
      "hygiene",
    ],
    explanation:
      "The project supports clean water and sanitation by improving access to safe water, sanitation facilities, hygiene, or water-related services.",
  },

  "SDG 7": {
    keywords: [
      "energy",
      "solar",
      "renewable energy",
      "electricity",
      "solar power",
      "clean energy",
    ],
    explanation:
      "The project supports affordable and clean energy through renewable energy, electricity access, energy efficiency, or clean energy technologies.",
  },

  "SDG 8": {
    keywords: [
      "employment",
      "livelihood",
      "job",
      "jobs",
      "business",
      "entrepreneurship",
      "income",
      "work",
      "skills training",
      "small business",
    ],
    explanation:
      "The project supports decent work and economic growth by creating employment opportunities, developing job skills, supporting businesses, or improving livelihoods.",
  },

  "SDG 9": {
    keywords: [
      "infrastructure",
      "technology",
      "innovation",
      "internet",
      "connectivity",
      "digital",
      "road",
      "facility",
      "industry",
    ],
    explanation:
      "The project supports infrastructure and innovation by developing facilities, improving connectivity, introducing technology, or strengthening local infrastructure.",
  },

  "SDG 10": {
    keywords: [
      "inequality",
      "inclusion",
      "social inclusion",
      "pwd",
      "disability",
      "persons with disabilities",
      "marginalized",
      "vulnerable",
    ],
    explanation:
      "The project supports reduced inequalities by improving inclusion, accessibility, and opportunities for disadvantaged or marginalized community members.",
  },

  "SDG 11": {
    keywords: [
      "community",
      "barangay",
      "housing",
      "urban",
      "transportation",
      "public transportation",
      "disaster preparedness",
      "community development",
      "settlement",
    ],
    explanation:
      "The project supports sustainable communities by improving local services, housing, transportation, community facilities, or community resilience.",
  },

  "SDG 12": {
    keywords: [
      "waste",
      "recycling",
      "plastic",
      "reuse",
      "consumption",
      "production",
      "waste management",
      "plastic reduction",
    ],
    explanation:
      "The project supports responsible consumption and production by reducing waste, promoting recycling, managing resources, or encouraging sustainable practices.",
  },

  "SDG 13": {
    keywords: [
      "climate",
      "climate change",
      "carbon",
      "emission",
      "disaster",
      "environment",
      "resilience",
      "climate action",
    ],
    explanation:
      "The project supports climate action by addressing climate-related risks, improving resilience, reducing environmental impacts, or promoting climate awareness.",
  },

  "SDG 14": {
    keywords: [
      "ocean",
      "marine",
      "coastal",
      "fisheries",
      "fishing",
      "sea",
      "coral",
      "marine life",
    ],
    explanation:
      "The project supports life below water by protecting marine ecosystems, supporting sustainable fisheries, or conserving coastal and ocean resources.",
  },

  "SDG 15": {
    keywords: [
      "forest",
      "tree planting",
      "wildlife",
      "biodiversity",
      "land",
      "reforestation",
      "conservation",
      "ecosystem",
    ],
    explanation:
      "The project supports life on land by protecting forests, wildlife, biodiversity, ecosystems, or terrestrial natural resources.",
  },

  "SDG 16": {
    keywords: [
      "governance",
      "justice",
      "peace",
      "safety",
      "security",
      "government",
      "transparency",
      "accountability",
      "institution",
    ],
    explanation:
      "The project supports peace, justice, and strong institutions by improving governance, community safety, accountability, access to justice, or institutional services.",
  },

  "SDG 17": {
    keywords: [
      "partnership",
      "partnerships",
      "organization",
      "government",
      "school",
      "private sector",
      "collaboration",
      "stakeholder",
      "community groups",
    ],
    explanation:
      "The project supports partnerships by bringing together government offices, organizations, schools, businesses, or community groups to achieve development goals.",
  },
};

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function getMatchedKeywords(text, keywords) {
  return keywords.filter((keyword) => {
    const regex = new RegExp(
      `\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "i"
    );

    return regex.test(text);
  });
}

function getUniqueEvidence(evidence = []) {
  return [
    ...new Set(
      evidence
        .map((item) =>
          typeof item === "string"
            ? item
            : item?.context
        )
        .filter(Boolean)
        .map((item) =>
          item.replace(/\s+/g, " ").trim()
        )
    ),
  ].slice(0, 3);
}

function buildExplanation(
  sdg,
  text,
  evidence = []
) {
  const rule = SDG_EXPLANATIONS[sdg];

  if (!rule) {
    return {
      sdg,
      name: SDG_NAMES[sdg] || sdg,
      explanation:
        "The project contains information that may be relevant to this Sustainable Development Goal.",
      matchedKeywords: [],
      evidence: [],
    };
  }

  const matchedKeywords =
    getMatchedKeywords(
      text,
      rule.keywords
    );

  const evidenceTexts =
    getUniqueEvidence(evidence);

  return {
    sdg,
    name: SDG_NAMES[sdg] || sdg,
    explanation: rule.explanation,
    matchedKeywords,
    evidence: evidenceTexts,
  };
}

function generateSDGRelevance(
  text,
  primaryTag,
  relatedSDGs = [],
  evidenceBySDG = {}
) {
  const normalizedText =
    normalizeText(text);

  const explanations = [];

  if (primaryTag) {
    explanations.push(
      buildExplanation(
        primaryTag,
        normalizedText,
        evidenceBySDG[primaryTag] || []
      )
    );
  }

  for (const item of relatedSDGs) {
    const tag = item?.tag;

    if (
      !tag ||
      tag === primaryTag ||
      explanations.some(
        (entry) => entry.sdg === tag
      )
    ) {
      continue;
    }

    explanations.push(
      buildExplanation(
        tag,
        normalizedText,
        evidenceBySDG[tag] || []
      )
    );
  }

  return explanations;
}

module.exports = {
  generateSDGRelevance,
};