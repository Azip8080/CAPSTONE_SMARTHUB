const SDG_KEYWORDS = require("./keywords");

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findKeywordMatches(text) {
  const grouped = {};
  const allMatches = [];

  for (const [sdg, keywords] of Object.entries(SDG_KEYWORDS)) {
    const matchesForSDG = [];

    for (const keyword of keywords) {
      const regex = new RegExp(
        `\\b${escapeRegex(keyword)}\\b`,
        "gi"
      );

      let match;

      while ((match = regex.exec(text)) !== null) {
        const item = {
          keyword,
          matchedText: match[0],
          start: match.index,
          end: match.index + match[0].length,
        };

        matchesForSDG.push(item);

        allMatches.push({
          sdg,
          ...item,
        });
      }
    }

    if (matchesForSDG.length > 0) {
      grouped[sdg] = matchesForSDG.sort(
        (a, b) => a.start - b.start
      );
    }
  }

  allMatches.sort((a, b) => a.start - b.start);

  const evidenceBySDG = Object.fromEntries(
    Object.entries(grouped).map(([sdg, matches]) => [
      sdg,
      matches.map((item) => ({
        ...item,
        context: text.slice(
          Math.max(0, item.start - 60),
          Math.min(text.length, item.end + 60)
        ),
      })),
    ])
  );

  return {
    grouped,
    matches: allMatches,
    totalMatches: allMatches.length,
    evidenceBySDG,
  };
}

module.exports = { findKeywordMatches };