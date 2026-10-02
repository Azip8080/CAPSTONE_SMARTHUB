const { HfInference } = require("@huggingface/inference");

const SDG_KEYWORDS = require("./keywords");

const COMPILED_KEYWORDS = Object.entries(
  SDG_KEYWORDS
).map(([tag, keywords]) => ({
  tag,
  patterns: keywords.map((keyword) => {
    const escaped = String(keyword).replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    return new RegExp(
      `\\b${escaped}\\b`,
      "gi"
    );
  }),
}));

const hf = new HfInference(
  process.env.HF_TOKEN
);

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

const SDG_TAGS = [
  "SDG 1",
  "SDG 2",
  "SDG 3",
  "SDG 4",
  "SDG 5",
  "SDG 6",
  "SDG 7",
  "SDG 8",
  "SDG 9",
  "SDG 10",
  "SDG 11",
  "SDG 12",
  "SDG 13",
  "SDG 14",
  "SDG 15",
  "SDG 16",
  "SDG 17",
];

function keywordClassify(text) {
  const scores = {};

  for (const {
    tag,
    patterns,
  } of COMPILED_KEYWORDS) {
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

  if (sorted.length === 0) {
    return null;
  }

  const primary = sorted[0];

  const primaryScore = primary[1];

  const detected = sorted
    .filter(([tag, score]) => {
      if (tag === primary[0]) {
        return true;
      }

      const minimumScore = Math.max(
        2,
        primaryScore * 0.35
      );

      return score >= minimumScore;
    })
    .slice(0, 6);

  const sdgTags = detected.map(
    ([tag]) => tag
  );

  const relatedSDGs = detected
    .slice(1)
    .map(([tag, score]) => ({
      tag,
      score,
      confidence: Math.min(
        score / 10,
        1
      ),
    }));

  const topMatches = sorted
    .slice(0, 6)
    .map(([tag, score]) => ({
      tag,
      score,
      confidence: Math.min(
        score / 10,
        1
      ),
    }));

  return {
    tag: primary[0],
    sdgTags,
    confidence: Math.min(
      primaryScore / 10,
      1
    ),
    method: "keyword",
    score: primaryScore,
    relatedSDGs,
    topMatches,
  };
}

async function huggingFaceClassify(
  text
) {
  try {
    const result =
      await hf.zeroShotClassification({
        model:
          "facebook/bart-large-mnli",
        inputs: text.slice(0, 1000),
        parameters: {
          candidate_labels:
            SDG_LABELS,
          multi_label: true,
        },
      });

    const ranked = result.labels
      .map((label, index) => ({
        label,
        tag:
          SDG_TAGS[
            SDG_LABELS.indexOf(label)
          ],
        score: result.scores[index],
      }))
      .filter(
        (item) =>
          item.tag &&
          item.score >= 0.15
      )
      .sort(
        (a, b) =>
          b.score - a.score
      )
      .slice(0, 6);

    if (!ranked.length) {
      return null;
    }

    const primary = ranked[0];

    const sdgTags = ranked.map(
      (item) => item.tag
    );

    const relatedSDGs = ranked
      .slice(1)
      .map((item) => ({
        tag: item.tag,
        label: item.label,
        score: item.score,
        confidence: item.score,
      }));

    const topMatches = ranked.map(
      (item) => ({
        tag: item.tag,
        label: item.label,
        score: item.score,
        confidence: item.score,
      })
    );

    return {
      tag: primary.tag,
      sdgTags,
      confidence: primary.score,
      method: "huggingface",
      score: primary.score,
      relatedSDGs,
      topMatches,
    };
  } catch (err) {
    console.error(
      "Hugging Face classification error:",
      err.message
    );

    return null;
  }
}

async function classifyText(text) {
  if (
    !text ||
    text.trim().length === 0
  ) {
    throw new Error(
      "No text provided for classification"
    );
  }

  if (process.env.HF_TOKEN) {
    const hfResult =
      await huggingFaceClassify(text);

    if (hfResult) {
      return hfResult;
    }
  }

  const kwResult =
    keywordClassify(text);

  if (kwResult) {
    return kwResult;
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