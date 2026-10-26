const SDG_KEYWORDS = require("./keywords");


function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getSentenceContext(text, start, end) {
  let sentenceStart = 0;
  let sentenceEnd = text.length;

  const before = text.slice(0, start);
  const after = text.slice(end);

  const startMatch = before.match(/(?:^|[.!?]\s+|\n+)([^.!?]*)$/);
  const endMatch = after.match(/^[^.!?]*(?:[.!?]|$)/);

  if (startMatch) {
    sentenceStart = start - startMatch[1].length;
  }

  if (endMatch) {
    sentenceEnd = end + endMatch[0].length;
  }

  return text.slice(sentenceStart, sentenceEnd).trim();
}

function findKeywordMatches(text) {
  const sourceText = String(text || "");
  const grouped = {};
  const allMatches = [];

  if (!sourceText.trim()) {
    return {
      grouped,
      matches: allMatches,
      totalMatches: 0,
      evidenceBySDG: {}
    };
  }

  for (const [sdg, keywords] of Object.entries(SDG_KEYWORDS)) {
    const matchesForSDG = [];

    for (const keyword of keywords) {
      const escapedKeyword = escapeRegex(keyword).replace(/\s+/g, "\\s+");
      const regex = new RegExp(`\\b${escapedKeyword}\\b`, "gi");

      let match;

      while ((match = regex.exec(sourceText)) !== null) {
        const item = {
          keyword,
          matchedText: match[0],
          start: match.index,
          end: match.index + match[0].length
        };

        matchesForSDG.push(item);

        allMatches.push({
          sdg,
          ...item
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
        context: getSentenceContext(
          sourceText,
          item.start,
          item.end
        )
      }))
    ])
  );

  return {
    grouped,
    matches: allMatches,
    totalMatches: allMatches.length,
    evidenceBySDG
  };
}


module.exports = { findKeywordMatches };