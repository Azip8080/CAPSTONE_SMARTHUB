const SDG_KEYWORDS = require("./keywords");

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getSentenceContext(text, start, end) {
  const before = text.slice(0, start);
  const after = text.slice(end);

  const sentenceStartMatch = before.match(
    /(?:^|[.!?]\s+)([^.!?]*)$/
  );

  const sentenceEndMatch = after.match(
    /^[^.!?]*(?:[.!?]|$)/
  );

  const sentenceStart = sentenceStartMatch
    ? start - sentenceStartMatch[1].length
    : 0;

  const sentenceEnd = sentenceEndMatch
    ? end + sentenceEndMatch[0].length
    : text.length;

  return text
    .slice(sentenceStart, sentenceEnd)
    .trim();
}

function findKeywordMatches(text) {
  const grouped = {};
  const allMatches = [];

  for (const [sdg, keywords] of Object.entries(
    SDG_KEYWORDS
  )) {
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
        context: getSentenceContext(
          text,
          item.start,
          item.end
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