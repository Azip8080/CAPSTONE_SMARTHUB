
const { HfInference } = require("@huggingface/inference");

const SDG_KEYWORDS = require("./keywords");

const hf = new HfInference(process.env.HF_TOKEN);

const CHUNK_SIZE = 900;
const CHUNK_OVERLAP = 150;
const MAX_MODEL_CHUNKS = 40;
const MIN_HF_SCORE = 0.15;

const SDG_LABELS = [
  "No Poverty",
  "Zero Hunger",
  "Good Health and Well-Being",
  "Quality Education",
  "Gender Equality",
  "Clean Water and Sanitation",
  "Affordable and Clean Energy",
  "Decent Work and Economic Growth",
  "Industry Innovation and Infrastructure",
  "Reduced Inequalities",
  "Sustainable Cities and Communities",
  "Responsible Consumption and Production",
  "Climate Action",
  "Life Below Water",
  "Life on Land",
  "Peace Justice and Strong Institutions",
  "Partnerships for the Goals",
];

const SDG_TAGS = SDG_LABELS.map(
  (_, index) => `SDG ${index + 1}`
);

const COMPILED_KEYWORDS = Object.entries(
  SDG_KEYWORDS
).map(([tag, keywords]) => ({
  tag,
  patterns: keywords.map((keyword) => {
    const escaped = String(keyword).replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    return new RegExp(`\\b${escaped}\\b`, "gi");
  }),
}));

function splitTextIntoChunks(text) {
  const normalized = String(text || "").trim();

  if (!normalized) {
    return [];
  }

  const chunks = [];
  const step = CHUNK_SIZE - CHUNK_OVERLAP;

  for (
    let start = 0;
    start < normalized.length;
    start += step
  ) {
    const chunk = normalized
      .slice(start, start + CHUNK_SIZE)
      .trim();

    if (chunk) {
      chunks.push({
        start,
        text: chunk,
      });
    }

    if (start + CHUNK_SIZE >= normalized.length) {
      break;
    }
  }

  return chunks;
}

function selectRepresentativeChunks(chunks) {
  if (chunks.length <= MAX_MODEL_CHUNKS) {
    return chunks;
  }

  const selected = [];
  const usedIndexes = new Set();

  for (let i = 0; i < MAX_MODEL_CHUNKS; i += 1) {
    const index = Math.round(
      (i * (chunks.length - 1)) /
        (MAX_MODEL_CHUNKS - 1)
    );

    if (!usedIndexes.has(index)) {
      usedIndexes.add(index);
      selected.push(chunks[index]);
    }
  }

  return selected;
}

function keywordClassify(text) {
  const scores = {};

  for (const { tag, patterns } of COMPILED_KEYWORDS) {
    let score = 0;

    for (const pattern of patterns) {
      pattern.lastIndex = 0;

      const matches = text.match(pattern);

      if (matches) {
        score += matches.length;
      }
    }

    scores[tag] = score;
  }

  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .filter(([, score]) => score > 0);

  if (!sorted.length) {
    return null;
  }

  const [primaryTag, primaryScore] = sorted[0];

  const detected = sorted
    .filter(([tag, score]) => {
      if (tag === primaryTag) {
        return true;
      }

      return score >= Math.max(2, primaryScore * 0.35);
    })
    .slice(0, 6);

  const sdgTags = detected.map(([tag]) => tag);

  const relatedSDGs = detected
    .slice(1)
    .map(([tag, score]) => ({
      tag,
      score,
      confidence: Math.min(score / 10, 1),
    }));

  const topMatches = sorted
    .slice(0, 6)
    .map(([tag, score]) => ({
      tag,
      score,
      confidence: Math.min(score / 10, 1),
    }));

  return {
    tag: primaryTag,
    sdgTags,
    confidence: Math.min(primaryScore / 10, 1),
    method: "keyword",
    score: primaryScore,
    relatedSDGs,
    topMatches,
  };
}

async function huggingFaceClassify(text) {
  const allChunks = splitTextIntoChunks(text);
  const chunks = selectRepresentativeChunks(allChunks);

  if (!chunks.length) {
    return null;
  }

  const scoreTotals = SDG_LABELS.map(() => 0);
  let successfulChunks = 0;

  for (const chunk of chunks) {
    try {
      const result = await hf.zeroShotClassification({
        model: "facebook/bart-large-mnli",
        inputs: chunk.text,
        parameters: {
          candidate_labels: SDG_LABELS,
          multi_label: true,
        },
      });

      if (
        !result ||
        !Array.isArray(result.labels) ||
        !Array.isArray(result.scores)
      ) {
        continue;
      }

      const scoreByLabel = new Map();

      result.labels.forEach((label, index) => {
        scoreByLabel.set(label, Number(result.scores[index]) || 0);
      });

      SDG_LABELS.forEach((label, index) => {
        scoreTotals[index] += scoreByLabel.get(label) || 0;
      });

      successfulChunks += 1;
    } catch (error) {
      console.error(
        "[AI] Hugging Face chunk classification failed:",
        error.message
      );
    }
  }

  if (!successfulChunks) {
    return null;
  }

  const ranked = SDG_LABELS.map((label, index) => ({
    label,
    tag: SDG_TAGS[index],
    score: scoreTotals[index] / successfulChunks,
  }))
    .filter((item) => item.score >= MIN_HF_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  if (!ranked.length) {
    return null;
  }

  const primary = ranked[0];

  return {
    tag: primary.tag,
    sdgTags: ranked.map((item) => item.tag),
    confidence: primary.score,
    method: "huggingface",
    score: primary.score,
    relatedSDGs: ranked.slice(1).map((item) => ({
      tag: item.tag,
      label: item.label,
      score: item.score,
      confidence: item.score,
    })),
    topMatches: ranked.map((item) => ({
      tag: item.tag,
      label: item.label,
      score: item.score,
      confidence: item.score,
    })),
    modelAnalysis: {
      totalChunks: allChunks.length,
      analyzedChunks: successfulChunks,
      sampledChunks: chunks.length,
    },
  };
}

async function classifyText(text) {
  const fullText = String(text || "").trim();

  if (!fullText) {
    throw new Error("No text provided for classification");
  }

  if (process.env.HF_TOKEN) {
    const hfResult = await huggingFaceClassify(fullText);

    if (hfResult) {
      return hfResult;
    }
  }

  const keywordResult = keywordClassify(fullText);

  if (keywordResult) {
    return keywordResult;
  }

  return {
    tag: "SDG 1",
    sdgTags: [],
    confidence: 0,
    method: "default",
    score: 0,
    relatedSDGs: [],
    topMatches: [],
  };
}

module.exports = {
  classifyText,
};
