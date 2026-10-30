import { useEffect, useMemo, useState } from "react";
import styles from "./FeaturedGuides.module.css";
import { fetchGuides } from "../../../services/knowledgeService";

const API_URL = "https://sdg-smarthub-api.onrender.com";

const SDG_COLORS = {
  "SDG 1": "#E5243B",
  "SDG 2": "#DDA63A",
  "SDG 3": "#4C9F38",
  "SDG 4": "#C5192D",
  "SDG 5": "#FF3A21",
  "SDG 6": "#26BDE2",
  "SDG 7": "#FCC30B",
  "SDG 8": "#A21942",
  "SDG 9": "#FD6925",
  "SDG 10": "#DD1367",
  "SDG 11": "#FD9D24",
  "SDG 12": "#BF8B2E",
  "SDG 13": "#3F7E44",
  "SDG 14": "#0A97D9",
  "SDG 15": "#56C02B",
  "SDG 16": "#00689D",
  "SDG 17": "#19486A",
};

const SDG_FILTERS = [
  "All",
  ...Array.from({ length: 17 }, (_, index) => `SDG ${index + 1}`),
];

function getGuideSDGs(guide) {
  if (Array.isArray(guide.sdgTags) && guide.sdgTags.length > 0) {
    return guide.sdgTags;
  }

  return guide.sdgTag ? [guide.sdgTag] : [];
}

function getFileUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

function getYouTubeId(url = "") {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return parsed.pathname.slice(1).split("/")[0];
    }

    if (
      ["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(host)
    ) {
      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v");
      }

      const match = parsed.pathname.match(
        /^\/(shorts|embed|live)\/([^/?]+)/
      );

      return match?.[2] || null;
    }

    return null;
  } catch {
    return null;
  }
}

function getVideoEmbedUrl(guide) {
  if (guide.embedUrl) {
    return guide.embedUrl;
  }

  const videoId = getYouTubeId(guide.sourceUrl || "");

  return videoId
    ? `https://www.youtube.com/embed/${videoId}`
    : "";
}

function isVideoResource(guide) {
  const type = (guide.resourceType || "").toLowerCase();

  return [
    "youtube",
    "youtube-video",
    "youtube-shorts",
    "shorts",
    "video",
  ].includes(type);
}

function isShortVideo(guide) {
  const type = (guide.resourceType || "").toLowerCase();

  return (
    type === "youtube-shorts" ||
    type === "shorts" ||
    guide.sourceUrl?.includes("/shorts/")
  );
}

function GuideCard({ guide, onRead }) {
  const sdgs = getGuideSDGs(guide);
  const primarySDG = sdgs[0] || "General SDG Guide";
  const tagColor = SDG_COLORS[sdgs[0]] || "#3b82f6";
  const isVideo = isVideoResource(guide);

  const thumbnail =
    guide.thumbnailUrl ||
    guide.photos?.[0] ||
    (getYouTubeId(guide.sourceUrl || "")
      ? `https://img.youtube.com/vi/${getYouTubeId(guide.sourceUrl)}/hqdefault.jpg`
      : "");

  return (
    <article
      className={styles.card}
      onClick={() => onRead(guide)}
    >
      <div className={styles.cardImage}>
        {thumbnail ? (
          <img
            src={getFileUrl(thumbnail)}
            alt={guide.title}
            className={styles.guideImage}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span>{isVideo ? "Video Resource" : "Knowledge Hub"}</span>
          </div>
        )}

        {isVideo && (
          <div className={styles.videoPlayOverlay}>
            <span>▶</span>
          </div>
        )}

        <div className={styles.cardOverlay}>
          <span
            className={styles.cardTag}
            style={{ background: tagColor }}
          >
            {primarySDG}
          </span>

          {guide.category && (
            <span className={styles.cardCat}>
              {guide.category}
            </span>
          )}
        </div>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          <span>{guide.category || "Resource"}</span>
        </div>

        <h3 className={styles.cardTitle}>
          {guide.title}
        </h3>

        <p className={styles.cardDescription}>
          {guide.summary ||
            guide.description ||
            "Explore this resource to learn more about sustainable community development."}
        </p>

        <div className={styles.cardBottom}>
          <div className={styles.sdgList}>
            {sdgs.slice(0, 3).map((sdg) => (
              <span
                key={sdg}
                className={styles.sdgBadge}
                style={{
                  borderColor: SDG_COLORS[sdg] || "#cbd5e1",
                  color: SDG_COLORS[sdg] || "#64748b",
                }}
              >
                {sdg}
              </span>
            ))}
          </div>

          <button
            className={styles.readBtn}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRead(guide);
            }}
          >
            {isVideo ? "Watch →" : "Read →"}
          </button>
        </div>
      </div>
    </article>
  );
}

function GuideModal({ guide, onClose }) {
  const sdgs = getGuideSDGs(guide);
  const isVideo = isVideoResource(guide);
  const isShort = isShortVideo(guide);
  const embedUrl = getVideoEmbedUrl(guide);

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div className={styles.modalTop}>
            <div className={styles.modalBadges}>
              {sdgs.length > 0 ? (
                sdgs.map((sdg) => (
                  <span
                    key={sdg}
                    className={styles.modalSdgTag}
                    style={{
                      background: SDG_COLORS[sdg] || "#3b82f6",
                    }}
                  >
                    {sdg}
                  </span>
                ))
              ) : (
                <span className={styles.modalCatTag}>
                  General SDG Guide
                </span>
              )}

              {guide.category && (
                <span className={styles.modalCatTag}>
                  {guide.category}
                </span>
              )}
            </div>

            <button
              className={styles.modalClose}
              type="button"
              onClick={onClose}
              aria-label="Close resource"
            >
              ×
            </button>
          </div>

          <h2 className={styles.modalTitle}>
            {guide.title}
          </h2>

          {guide.summary && (
            <p className={styles.modalSummary}>
              {guide.summary}
            </p>
          )}
        </div>

        <div className={styles.modalBody}>
          {isVideo && embedUrl ? (
            <div
              className={
                isShort
                  ? styles.videoShortWrapper
                  : styles.videoWrapper
              }
            >
              <iframe
                src={embedUrl}
                title={guide.title || "Knowledge Hub video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          ) : (
            guide.photos?.length > 0 && (
              <img
                src={getFileUrl(guide.photos[0])}
                alt={guide.title}
                className={styles.modalImage}
              />
            )
          )}

          {isVideo && !embedUrl && (
            <p className={styles.statusError}>
              Video embed URL is unavailable.
            </p>
          )}

          {!isVideo && guide.thumbnailUrl && (
            <img
              src={getFileUrl(guide.thumbnailUrl)}
              alt={guide.title}
              className={styles.modalImage}
            />
          )}

          <div className={styles.modalInfo}>
            {guide.category && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>
                  Category
                </span>
                <span className={styles.infoValue}>
                  {guide.category}
                </span>
              </div>
            )}

            {guide.resourceType && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>
                  Resource Type
                </span>
                <span className={styles.infoValue}>
                  {guide.resourceType}
                </span>
              </div>
            )}
          </div>

          {guide.content && (
            <div className={styles.modalContent}>
              {guide.content}
            </div>
          )}

          {guide.document?.path && (
            <a
              href={getFileUrl(guide.document.path)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.externalResourceLink}
            >
              Open document ↗
            </a>
          )}

          {guide.sourceUrl && (
            <a
              href={guide.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.externalResourceLink}
            >
              {isVideo ? "Open on YouTube ↗" : "Visit original resource ↗"}
            </a>
          )}

          {Array.isArray(guide.tags) && guide.tags.length > 0 && (
            <div className={styles.modalTags}>
              <span className={styles.tagsTitle}>Topics</span>

              <div className={styles.tagsList}>
                {guide.tags.map((tag) => (
                  <span
                    key={tag}
                    className={styles.topicTag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FeaturedGuides({
  sdgFilter = "All",
  onSdgFilter,
}) {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeGuide, setActiveGuide] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    fetchGuides()
      .then((data) => {
        setGuides(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        setError(e.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const values = guides
      .map((guide) => guide.category)
      .filter(Boolean);

    return ["All", ...Array.from(new Set(values))];
  }, [guides]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return guides.filter((guide) => {
      const sdgs = getGuideSDGs(guide);

      const matchesSDG =
        sdgFilter === "All" || sdgs.includes(sdgFilter);

      const matchesCategory =
        categoryFilter === "All" ||
        guide.category === categoryFilter;

      const searchableText = [
        guide.title,
        guide.summary,
        guide.description,
        guide.content,
        guide.category,
        guide.resourceType,
        guide.sourceUrl,
        ...(guide.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      return matchesSDG && matchesCategory && matchesSearch;
    });
  }, [guides, search, categoryFilter, sdgFilter]);

  return (
    <section>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>
            Featured Resources
          </h2>

          <p className={styles.sectionSubtitle}>
            Explore guides and learning materials to help your community
            understand and act on the SDGs.
          </p>
        </div>

        <span className={styles.resultCount}>
          {filtered.length} resource{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>⌕</span>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources..."
            aria-label="Search resources"
          />
        </div>

        <select
          className={styles.filter}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === "All" ? "All categories" : category}
            </option>
          ))}
        </select>

        <select
          className={styles.filter}
          value={sdgFilter}
          onChange={(e) => onSdgFilter?.(e.target.value)}
        >
          {SDG_FILTERS.map((sdg) => (
            <option key={sdg} value={sdg}>
              {sdg === "All" ? "All SDGs" : sdg}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <p className={styles.status}>
          Loading resources…
        </p>
      )}

      {error && (
        <p className={styles.statusError}>
          {error}
        </p>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⌕</div>

          <h3>No resources found</h3>

          <p>Try changing your search or filters.</p>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategoryFilter("All");
              onSdgFilter?.("All");
            }}
          >
            Clear filters
          </button>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className={styles.grid}>
          {filtered.map((guide) => (
            <GuideCard
              key={guide._id}
              guide={guide}
              onRead={setActiveGuide}
            />
          ))}
        </div>
      )}

      {activeGuide && (
        <GuideModal
          guide={activeGuide}
          onClose={() => setActiveGuide(null)}
        />
      )}
    </section>
  );
}

export default FeaturedGuides;