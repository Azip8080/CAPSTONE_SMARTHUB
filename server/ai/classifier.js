const { HfInference } = require("@huggingface/inference");
const SDG_KEYWORDS    = require("./keywords");

const hf = new HfInference(process.env.HF_TOKEN);

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
  "SDG 1","SDG 2","SDG 3","SDG 4","SDG 5","SDG 6","SDG 7","SDG 8","SDG 9",
  "SDG 10","SDG 11","SDG 12","SDG 13","SDG 14","SDG 15","SDG 16","SDG 17",
];

function keywordClassify(text) {
  const lower  = text.toLowerCase();
  const scores = {};

  for (const [tag, keywords] of Object.entries(SDG_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw}\\b`, "gi");
      const matches = lower.match(regex);
      if (matches) score += matches.length;
    }
    scores[tag] = score;
  }

  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .filter(([, score]) => score > 0);

  if (sorted.length === 0) return null;

  return {
    tag:        sorted[0][0],
    confidence: Math.min(sorted[0][1] / 10, 1),
    method:     "keyword",
    topMatches: sorted.slice(0, 3).map(([tag, score]) => ({ tag, score })),
  };
}

async function huggingFaceClassify(text) {
  try {
    const result = await hf.zeroShotClassification({
      model:      "facebook/bart-large-mnli",
      inputs:     text.slice(0, 1000),
      parameters: { candidate_labels: SDG_LABELS },
    });

    const topIndex = SDG_LABELS.indexOf(result.labels[0]);
    const tag      = SDG_TAGS[topIndex] || "SDG 1";

    return {
      tag,
      confidence: result.scores[0],
      method:     "huggingface",
      topMatches: result.labels.slice(0, 3).map((label, i) => ({
        tag:   SDG_TAGS[SDG_LABELS.indexOf(label)],
        label,
        score: result.scores[i],
      })),
    };
  } catch (err) {
    console.error("Hugging Face classification error:", err.message);
    return null;
  }
}

async function classifyText(text) {
  if (!text || text.trim().length === 0) {
    throw new Error("No text provided for classification");
  }

  if (process.env.HUGGINGFACE_API_KEY) {
    const hfResult = await huggingFaceClassify(text);
    if (hfResult) return hfResult;
  }

  const kwResult = keywordClassify(text);
  if (kwResult) return kwResult;

  return {
    tag:        "SDG 1",
    confidence: 0,
    method:     "default",
    topMatches: [],
  };
}

module.exports = { classifyText };