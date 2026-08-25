import { useEffect, useState } from "react";
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

function GuideCard({ guide, onRead }) {
  const tagColor = SDG_COLORS[guide.sdgTag] || "#3b82f6";
  return (
    <div className={styles.card} onClick={() => onRead(guide)}>
      <div className={styles.cardImage}>
        <span className={styles.cardTag} style={{ background: tagColor }}>
          {guide.sdgTag}
        </span>
        <span className={styles.cardCat}>{guide.category}</span>
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{guide.title}</h3>
        <p className={styles.cardDescription}>{guide.summary}</p>
        <div className={styles.cardFooter}>
          <span className={styles.readTime}>{guide.readTime}</span>
          <button
            className={styles.readBtn}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRead(guide);
            }}
          >
            Read guide →
          </button>
        </div>
      </div>
    </div>
  );
}

function GuideModal({ guide, onClose }) {
  const tagColor = SDG_COLORS[guide.sdgTag] || "#3b82f6";
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTop}>
            <div className={styles.modalBadges}>
              <span className={styles.modalSdgTag} style={{ background: tagColor }}>
                {guide.sdgTag}
              </span>
              <span className={styles.modalCatTag}>{guide.category}</span>
            </div>
            <button className={styles.modalClose} type="button" onClick={onClose}>✕</button>
          </div>
          <h2 className={styles.modalTitle}>{guide.title}</h2>
        </div>
        <div className={styles.modalBody}>
          <p className={styles.modalContent}>{guide.content}</p>
        </div>
      </div>
    </div>
  );
}

function FeaturedGuides({ sdgFilter = "All" }) {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeGuide, setActiveGuide] = useState(null);

  useEffect(() => {
    fetchGuides()
      .then(setGuides)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    sdgFilter === "All" ? guides : guides.filter((g) => g.sdgTag === sdgFilter);

  return (
    <section>
      <h2 className={styles.sectionTitle}>Featured Guides</h2>
      <p className={styles.sectionSubtitle}>
        Curated resources to help you understand and act on the SDGs.
      </p>

      {loading && <p className={styles.status}>Loading guides…</p>}
      {error && <p className={styles.statusError}>{error}</p>}

      {!loading && !error && (
        filtered.length === 0 ? (
          <p className={styles.status}>No guides yet for {sdgFilter}.</p>
        ) : (
          <div className={styles.grid}>
            {filtered.map((guide) => (
              <GuideCard key={guide._id} guide={guide} onRead={setActiveGuide} />
            ))}
          </div>
        )
      )}

      {activeGuide && (
        <GuideModal guide={activeGuide} onClose={() => setActiveGuide(null)} />
      )}
    </section>
  );
}

export default FeaturedGuides;