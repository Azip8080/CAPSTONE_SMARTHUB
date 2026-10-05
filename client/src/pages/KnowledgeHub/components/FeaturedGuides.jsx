import { useEffect, useMemo, useState } from "react";
import styles from "./FeaturedGuides.module.css";
import { fetchGuides } from "../../../services/knowledgeService";

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

function getGuideSDGs(guide) {
  if (
    Array.isArray(guide.sdgTags) &&
    guide.sdgTags.length > 0
  ) {
    return guide.sdgTags;
  }

  return guide.sdgTag
    ? [guide.sdgTag]
    : [];
}

function GuideCard({ guide, onRead }) {
  const sdgs = getGuideSDGs(guide);
  const primarySDG =
    sdgs[0] || "SDG";

  const tagColor =
    SDG_COLORS[primarySDG] || "#3b82f6";

  return (
    <article
      className={styles.card}
      onClick={() => onRead(guide)}
    >
      <div className={styles.cardImage}>
        {guide.photos?.length > 0 ? (
          <img
            src={`http://localhost:5000${guide.photos[0]}`}
            alt={guide.title}
            className={styles.guideImage}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span>Knowledge Hub</span>
          </div>
        )}

        <div className={styles.cardOverlay}>
          <span
            className={styles.cardTag}
            style={{
              background: tagColor,
            }}
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
          <span>
            {guide.category || "Resource"}
          </span>

          {guide.readTime && (
            <span>
              {guide.readTime}
            </span>
          )}
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
                  borderColor:
                    SDG_COLORS[sdg] ||
                    "#cbd5e1",
                  color:
                    SDG_COLORS[sdg] ||
                    "#64748b",
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
            Read →
          </button>
        </div>
      </div>
    </article>
  );
}

function GuideModal({ guide, onClose }) {
  const sdgs = getGuideSDGs(guide);

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
    >
      <div
        className={styles.modal}
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div className={styles.modalHeader}>
          <div className={styles.modalTop}>
            <div className={styles.modalBadges}>
              {sdgs.map((sdg) => (
                <span
                  key={sdg}
                  className={styles.modalSdgTag}
                  style={{
                    background:
                      SDG_COLORS[sdg] ||
                      "#3b82f6",
                  }}
                >
                  {sdg}
                </span>
              ))}

              {guide.category && (
                <span
                  className={styles.modalCatTag}
                >
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
          {guide.photos?.length > 0 && (
            <img
              src={`http://localhost:5000${guide.photos[0]}`}
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

            {guide.readTime && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>
                  Reading time
                </span>
                <span className={styles.infoValue}>
                  {guide.readTime}
                </span>
              </div>
            )}
          </div>

          <div className={styles.modalContent}>
            {guide.content}
          </div>

          {Array.isArray(guide.tags) &&
            guide.tags.length > 0 && (
              <div className={styles.modalTags}>
                <span
                  className={styles.tagsTitle}
                >
                  Topics
                </span>

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
  const [guides, setGuides] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [activeGuide, setActiveGuide] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("All");

  useEffect(() => {
    fetchGuides()
      .then(setGuides)
      .catch((e) =>
        setError(e.message)
      )
      .finally(() =>
        setLoading(false)
      );
  }, []);

  const categories = useMemo(() => {
    const values = guides
      .map((guide) => guide.category)
      .filter(Boolean);

    return [
      "All",
      ...Array.from(new Set(values)),
    ];
  }, [guides]);

  const filtered = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return guides.filter((guide) => {
      const sdgs = getGuideSDGs(guide);

      const matchesSDG =
        sdgFilter === "All" ||
        sdgs.includes(sdgFilter);

      const matchesCategory =
        categoryFilter === "All" ||
        guide.category ===
          categoryFilter;

      const searchableText = [
        guide.title,
        guide.summary,
        guide.description,
        guide.content,
        guide.category,
        ...(guide.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query ||
        searchableText.includes(query);

      return (
        matchesSDG &&
        matchesCategory &&
        matchesSearch
      );
    });
  }, [
    guides,
    search,
    categoryFilter,
    sdgFilter,
  ]);

  return (
    <section>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>
            Featured Resources
          </h2>

          <p className={styles.sectionSubtitle}>
            Explore guides and learning
            materials to help your community
            understand and act on the SDGs.
          </p>
        </div>

        <span className={styles.resultCount}>
          {filtered.length} resource
          {filtered.length !== 1
            ? "s"
            : ""}
        </span>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>
            ⌕
          </span>

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search resources..."
            aria-label="Search resources"
          />
        </div>

        <select
          className={styles.filter}
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(
              e.target.value
            )
          }
        >
          {categories.map((category) => (
            <option
              key={category}
              value={category}
            >
              {category === "All"
                ? "All categories"
                : category}
            </option>
          ))}
        </select>

        <select
          className={styles.filter}
          value={sdgFilter}
          onChange={(e) => {
            const value =
              e.target.value;

            if (onSdgFilter) {
              onSdgFilter(value);
            }
          }}
        >
          {SDG_FILTERS.map((sdg) => (
            <option
              key={sdg}
              value={sdg}
            >
              {sdg === "All"
                ? "All SDGs"
                : sdg}
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

      {!loading &&
        !error &&
        filtered.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              ⌕
            </div>

            <h3>No resources found</h3>

            <p>
              Try changing your search or
              filters.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategoryFilter("All");

                if (onSdgFilter) {
                  onSdgFilter("All");
                }
              }}
            >
              Clear filters
            </button>
          </div>
        )}

      {!loading &&
        !error &&
        filtered.length > 0 && (
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
          onClose={() =>
            setActiveGuide(null)
          }
        />
      )}
    </section>
  );
}

export default FeaturedGuides;