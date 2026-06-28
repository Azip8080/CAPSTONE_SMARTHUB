import { useState } from "react";
import styles from "./SDGGoals.module.css";

import sdg1 from "../../../assets/1.jpg";
import sdg2 from "../../../assets/2.jpg";
import sdg3 from "../../../assets/3.jpg";
import sdg4 from "../../../assets/4.jpg";
import sdg5 from "../../../assets/5.jpg";
import sdg6 from "../../../assets/6.jpg";
import sdg7 from "../../../assets/7.jpg";
import sdg8 from "../../../assets/8.jpg";
import sdg9 from "../../../assets/9.jpg";
import sdg10 from "../../../assets/10.jpg";
import sdg11 from "../../../assets/11.jpg";
import sdg12 from "../../../assets/12.jpg";
import sdg13 from "../../../assets/13.jpg";
import sdg14 from "../../../assets/14.jpg";
import sdg15 from "../../../assets/15.jpg";
import sdg16 from "../../../assets/16.jpg";
import sdg17 from "../../../assets/17.jpg";

const images = [
  sdg1,
  sdg2,
  sdg3,
  sdg4,
  sdg5,
  sdg6,
  sdg7,
  sdg8,
  sdg9,
  sdg10,
  sdg11,
  sdg12,
  sdg13,
  sdg14,
  sdg15,
  sdg16,
  sdg17,
];

const SDG_LIST = [
  {
    number: 1,
    label: "No Poverty",
    color: "#E5243B",
    description:
      "End poverty in all its forms everywhere. This goal aims to eradicate extreme poverty and reduce overall poverty rates by half.",
  },
  {
    number: 2,
    label: "Zero Hunger",
    color: "#DDA63A",
    description:
      "End hunger, achieve food security and improved nutrition, and promote sustainable agriculture.",
  },
  {
    number: 3,
    label: "Good Health",
    color: "#4C9F38",
    description:
      "Ensure healthy lives and promote well-being for all at all ages.",
  },
  {
    number: 4,
    label: "Quality Education",
    color: "#C5192D",
    description:
      "Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all.",
  },
  {
    number: 5,
    label: "Gender Equality",
    color: "#FF3A21",
    description:
      "Achieve gender equality and empower all women and girls.",
  },
  {
    number: 6,
    label: "Clean Water",
    color: "#26BDE2",
    description:
      "Ensure availability and sustainable management of water and sanitation for all communities.",
  },
  {
    number: 7,
    label: "Clean Energy",
    color: "#FCC30B",
    description:
      "Ensure access to affordable, reliable, sustainable, and modern energy for all.",
  },
  {
    number: 8,
    label: "Decent Work",
    color: "#A21942",
    description:
      "Promote sustained, inclusive, and sustainable economic growth and decent work.",
  },
  {
    number: 9,
    label: "Industry & Innovation",
    color: "#FD6925",
    description:
      "Build resilient infrastructure, promote inclusive industrialization, and foster innovation.",
  },
  {
    number: 10,
    label: "Reduced Inequalities",
    color: "#DD1367",
    description:
      "Reduce inequality within and among countries.",
  },
  {
    number: 11,
    label: "Sustainable Cities",
    color: "#FD9D24",
    description:
      "Make cities and human settlements inclusive, safe, resilient, and sustainable.",
  },
  {
    number: 12,
    label: "Responsible Consumption",
    color: "#BF8B2E",
    description:
      "Ensure sustainable consumption and production patterns.",
  },
  {
    number: 13,
    label: "Climate Action",
    color: "#3F7E44",
    description:
      "Take urgent action to combat climate change and its impacts.",
  },
  {
    number: 14,
    label: "Life Below Water",
    color: "#0A97D9",
    description:
      "Conserve and sustainably use the oceans and marine resources.",
  },
  {
    number: 15,
    label: "Life on Land",
    color: "#56C02B",
    description:
      "Protect and restore terrestrial ecosystems and biodiversity.",
  },
  {
    number: 16,
    label: "Peace & Justice",
    color: "#00689D",
    description:
      "Promote peaceful and inclusive societies and provide access to justice.",
  },
  {
    number: 17,
    label: "Partnerships",
    color: "#19486A",
    description:
      "Strengthen the means of implementation and revitalize global partnerships.",
  },
];

// Attach images automatically
SDG_LIST.forEach((sdg, index) => {
  sdg.image = images[index];
});

function SDGModal({ sdg, onClose }) {
  if (!sdg) return null;

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={styles.modalHeader}
          style={{ background: sdg.color }}
        >
          <span className={styles.modalNumber}>
            SDG {sdg.number}
          </span>

          <h2 className={styles.modalTitle}>
            {sdg.label}
          </h2>

          <button
            className={styles.modalClose}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.modalDescription}>
            {sdg.description}
          </p>

          <a
            href={`https://sdgs.un.org/goals/goal${sdg.number}`}
            target="_blank"
            rel="noreferrer"
            className={styles.modalLink}
          >
            Learn more on UN website →
          </a>
        </div>
      </div>
    </div>
  );
}

export default function SDGGoals() {
  const [selected, setSelected] = useState(null);

  return (
    <section>
      <h2 className={styles.sectionTitle}>
        The 17 Goals
      </h2>

      <p className={styles.sectionSubtitle}>
        Click on any goal to learn more about it.
      </p>

      <div className={styles.grid}>
        {SDG_LIST.map((sdg) => (
          <button
            key={sdg.number}
            className={styles.sdgCard}
            onClick={() => setSelected(sdg)}
          >
            <img
              src={sdg.image}
              alt={sdg.label}
              className={styles.sdgImage}
            />
          </button>
        ))}
      </div>

      <SDGModal
        sdg={selected}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}