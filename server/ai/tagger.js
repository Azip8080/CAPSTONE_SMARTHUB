const TAG_RULES = [
  {
    tag: "Poverty Reduction",
    keywords: [
      "poverty",
      "poverty reduction",
      "poverty alleviation",
      "kahirapan",
      "pagbawas ng kahirapan",
      "anti-poverty",
      "anti poverty",
    ],
  },
  {
    tag: "Financial Assistance",
    keywords: [
      "financial assistance",
      "cash assistance",
      "financial aid",
      "income support",
      "tulong pinansyal",
      "tulong pinansiyal",
      "ayuda",
      "ayudang pinansyal",
      "ayudang pinansiyal",
    ],
  },
  {
    tag: "Livelihood",
    keywords: [
      "livelihood",
      "livelihood program",
      "livelihood project",
      "livelihood assistance",
      "community livelihood",
      "kabuhayan",
      "tulong pangkabuhayan",
      "programang pangkabuhayan",
      "pagpapaunlad ng kabuhayan",
    ],
  },
  {
    tag: "Food Assistance",
    keywords: [
      "food assistance",
      "food distribution",
      "food security",
      "feeding program",
      "school feeding",
      "pagkain para sa komunidad",
      "programang pagpapakain",
      "pamamahagi ng pagkain",
      "seguridad sa pagkain",
    ],
  },
  {
    tag: "Agriculture",
    keywords: [
      "agriculture",
      "agricultural development",
      "farming",
      "farmer",
      "farmers",
      "organic farming",
      "sustainable agriculture",
      "agrikultura",
      "pagsasaka",
      "magsasaka",
      "sakahan",
      "kabuhayang pang-agrikultura",
    ],
  },
  {
    tag: "Nutrition",
    keywords: [
      "nutrition",
      "malnutrition",
      "nutrition program",
      "nutrisyon",
      "nutrisyon ng bata",
      "malnutrisyon",
    ],
  },
  {
    tag: "Health Services",
    keywords: [
      "healthcare",
      "health services",
      "health program",
      "health project",
      "public health",
      "health center",
      "barangay health center",
      "serbisyong pangkalusugan",
      "serbisyo sa kalusugan",
      "kalusugan ng komunidad",
      "barangay health program",
    ],
  },
  {
    tag: "Medical Assistance",
    keywords: [
      "medical assistance",
      "medical mission",
      "medical",
      "medical mission",
      "tulong medikal",
      "serbisyong medikal",
      "libreng checkup",
      "libreng pagpapagamot",
    ],
  },
  {
    tag: "Vaccination",
    keywords: [
      "vaccination",
      "vaccination program",
      "immunization",
      "vaccination program",
      "bakuna",
      "pagbabakuna",
      "bakunahan",
    ],
  },
  {
    tag: "Mental Health",
    keywords: [
      "mental health",
      "mental health program",
      "kalusugan ng isip",
      "kalusugang pangkaisipan",
    ],
  },
  {
    tag: "Education",
    keywords: [
      "education",
      "education program",
      "educational program",
      "education access",
      "inclusive education",
      "edukasyon",
      "programang pang-edukasyon",
      "access sa edukasyon",
      "edukasyon para sa lahat",
    ],
  },
  {
    tag: "Scholarship",
    keywords: [
      "scholarship",
      "scholarship program",
      "educational assistance",
      "iskolar",
      "iskolarship",
      "pagbibigay ng scholarship",
      "tulong pang-edukasyon",
    ],
  },
  {
    tag: "Skills Training",
    keywords: [
      "skills training",
      "skills training program",
      "training program",
      "vocational training",
      "pagsasanay sa kasanayan",
      "pagpapaunlad ng kasanayan",
      "kasanayan sa trabaho",
    ],
  },
  {
    tag: "Gender Equality",
    keywords: [
      "gender equality",
      "gender equality program",
      "gender program",
      "gender awareness",
      "pagkakapantay ng kasarian",
      "pagkakapantay-pantay",
      "kasarian",
    ],
  },
  {
    tag: "Women Empowerment",
    keywords: [
      "women empowerment",
      "women rights",
      "women leadership",
      "women participation",
      "pagpapalakas sa kababaihan",
      "empowerment ng kababaihan",
      "partisipasyon ng kababaihan",
      "liderato ng kababaihan",
      "karapatan ng kababaihan",
    ],
  },
  {
    tag: "Water Access",
    keywords: [
      "clean water",
      "drinking water",
      "potable water",
      "water supply",
      "water system",
      "water access",
      "malinis na tubig",
      "inuming tubig",
      "ligtas na inuming tubig",
      "sistema ng tubig",
      "suplay ng tubig",
      "suplay ng malinis na tubig",
    ],
  },
  {
    tag: "Sanitation",
    keywords: [
      "sanitation",
      "sanitation program",
      "hygiene",
      "hygiene program",
      "sewage",
      "sewer",
      "toilet",
      "toilets",
      "sanitasyon",
      "palikuran",
      "kalinisan",
      "imburnal",
    ],
  },
  {
    tag: "Renewable Energy",
    keywords: [
      "renewable energy",
      "clean energy",
      "solar power",
      "solar energy project",
      "solar project",
      "solar panel",
      "renewable energy project",
      "enerhiyang nababago",
      "enerhiyang solar",
      "lakas ng araw",
    ],
  },
  {
    tag: "Employment",
    keywords: [
      "employment",
      "employment opportunities",
      "job opportunities",
      "job creation",
      "employment program",
      "jobs",
      "trabaho",
      "empleyo",
      "oportunidad sa trabaho",
      "paglikha ng trabaho",
    ],
  },
  {
    tag: "Small Business",
    keywords: [
      "small business",
      "small business program",
      "micro business",
      "enterprise",
      "business",
      "entrepreneurship",
      "negosyo",
      "maliit na negosyo",
      "maliliit na negosyo",
      "pagnenegosyo",
      "tulong sa negosyo",
    ],
  },
  {
    tag: "Infrastructure",
    keywords: [
      "infrastructure",
      "infrastructure project",
      "public infrastructure",
      "imprastraktura",
      "imprastruktura",
      "imprastraktura ng komunidad",
    ],
  },
  {
    tag: "Road Development",
    keywords: [
      "road project",
      "road",
      "roads",
      "kalsada",
      "daan",
    ],
  },
  {
    tag: "Technology",
    keywords: [
      "technology",
      "technology project",
      "digital technology",
      "digital project",
      "digital transformation",
      "teknolohiya",
      "makabagong teknolohiya",
      "pagpapaunlad ng teknolohiya",
    ],
  },
  {
    tag: "Internet Connectivity",
    keywords: [
      "internet",
      "internet access",
      "internet connectivity",
      "connectivity",
      "broadband",
      "koneksyon",
      "digital infrastructure",
    ],
  },
  {
    tag: "Social Inclusion",
    keywords: [
      "social inclusion",
      "inclusive program",
      "inclusion program",
      "inclusive",
      "inclusion",
      "inklusyon",
      "pantay na access",
      "pantay na serbisyo",
    ],
  },
  {
    tag: "PWD Support",
    keywords: [
      "persons with disability",
      "disability",
      "pwd",
      "pwd assistance",
      "pwd program",
      "taong may kapansanan",
      "may kapansanan",
    ],
  },
  {
    tag: "Community Development",
    keywords: [
      "community development",
      "community project",
      "community program",
      "barangay development",
      "community facilities",
      "community development",
      "pagpapaunlad ng komunidad",
      "komunidad",
      "pamayanan",
    ],
  },
  {
    tag: "Housing",
    keywords: [
      "housing",
      "housing program",
      "housing project",
      "affordable housing",
      "pabahay",
      "murang pabahay",
      "abot-kayang pabahay",
      "pabahay para sa mahihirap",
    ],
  },
  {
    tag: "Public Transportation",
    keywords: [
      "public transport",
      "public transportation",
      "transport infrastructure",
      "transport",
      "transportasyon",
      "pampublikong transportasyon",
    ],
  },
  {
    tag: "Waste Management",
    keywords: [
      "waste management",
      "waste management program",
      "solid waste management",
      "waste",
      "garbage",
      "basura",
      "pamamahala ng basura",
      "solid waste management",
    ],
  },
  {
    tag: "Recycling",
    keywords: [
      "recycling",
      "recycling program",
      "recycle",
      "pagre-recycle",
      "pagrecycle",
      "muling paggamit",
      "pag-reuse",
    ],
  },
  {
    tag: "Plastic Reduction",
    keywords: [
      "plastic reduction",
      "plastic waste",
      "plastic",
      "basurang plastik",
      "pagbawas ng basura",
      "pagbawas",
    ],
  },
  {
    tag: "Climate Action",
    keywords: [
      "climate action",
      "climate program",
      "climate project",
      "climate change",
      "climate resilience",
      "klima",
      "pagbabago ng klima",
      "pagkilos para sa klima",
      "pag-angkop",
      "mitigasyon",
    ],
  },
  {
    tag: "Disaster Preparedness",
    keywords: [
      "disaster preparedness",
      "disaster risk reduction",
      "disaster risk management",
      "emergency preparedness",
      "disaster response",
      "paghahanda sa sakuna",
      "paghahanda sa bagyo",
      "paghahanda sa baha",
      "pagtugon sa sakuna",
    ],
  },
  {
    tag: "Coastal Conservation",
    keywords: [
      "coastal conservation",
      "coastal protection",
      "coastal cleanup",
      "marine conservation",
      "ocean conservation",
      "marine protection",
      "pangangalaga sa baybayin",
      "pangangalaga sa dagat",
      "pangangalaga sa karagatan",
    ],
  },
  {
    tag: "Fisheries",
    keywords: [
      "fisheries",
      "fishing",
      "fishing community",
      "fisheries program",
      "sustainable fishing",
      "pangingisda",
      "mangingisda",
      "pangisdaan",
      "sobrang pangingisda",
    ],
  },
  {
    tag: "Tree Planting",
    keywords: [
      "tree planting",
      "tree planting program",
      "tree planting project",
      "trees",
      "pagtatanim ng puno",
      "pagtatanim",
    ],
  },
  {
    tag: "Forest Conservation",
    keywords: [
      "forest conservation",
      "forest",
      "forests",
      "reforestation",
      "reforestation project",
      "afforestation",
      "pangangalaga ng gubat",
      "pangangalaga sa kagubatan",
      "pagpapanumbalik ng kagubatan",
    ],
  },
  {
    tag: "Wildlife Conservation",
    keywords: [
      "wildlife conservation",
      "wildlife",
      "habitat protection",
      "endangered species",
      "native species",
      "pangangalaga sa hayop",
      "tirahan ng mga hayop",
      "mga endangered species",
    ],
  },
  {
    tag: "Good Governance",
    keywords: [
      "good governance",
      "governance",
      "transparency",
      "accountability",
      "public service",
      "good governance",
      "mabuting pamamahala",
      "transparency",
      "pananagutan",
      "serbisyong pampubliko",
    ],
  },
  {
    tag: "Peace and Justice",
    keywords: [
      "peace",
      "justice",
      "peacebuilding",
      "mediation",
      "access to justice",
      "rule of law",
      "kapayapaan",
      "katarungan",
      "pagpapanatili ng kapayapaan",
      "pagresolba ng alitan",
      "pamamagitan",
    ],
  },
  {
    tag: "Community Safety",
    keywords: [
      "community safety",
      "community safety",
      "security",
      "crime prevention",
      "kaligtasan ng komunidad",
      "seguridad",
      "siguridad",
    ],
  },
  {
    tag: "Partnership",
    keywords: [
      "partnership",
      "partnerships",
      "partnership program",
      "government partnership",
      "community partnership",
      "ngo partnership",
      "collaboration",
      "stakeholder collaboration",
      "pakikipagsosyo",
      "pakikipagtambalan",
      "pakikipagtulungan",
      "pakikipagtulungan sa komunidad",
      "mga katuwang",
      "kooperasyon",
    ],
  },
];

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function generateTags(text, maxTags = 8) {
  const normalizedText = normalizeText(text);
  const results = [];

  if (!normalizedText) {
    return [];
  }

  for (const rule of TAG_RULES) {
    let score = 0;
    let matchedKeywords = [];

    for (const keyword of rule.keywords) {
      const normalizedKeyword = normalizeText(keyword);

      if (!normalizedKeyword) {
        continue;
      }

      const regex = new RegExp(
        `\\b${escapeRegex(normalizedKeyword)}\\b`,
        "gi"
      );

      const matches = normalizedText.match(regex);

      if (matches) {
        score += matches.length;
        matchedKeywords.push(keyword);
      }
    }

    if (score > 0) {
      results.push({
        tag: rule.tag,
        score,
        matchedKeywords: [...new Set(matchedKeywords)],
      });
    }
  }

  return results
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.tag.localeCompare(b.tag);
    })
    .slice(0, maxTags);
}

module.exports = {
  generateTags,
};