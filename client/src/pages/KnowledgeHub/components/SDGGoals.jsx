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
      "No Poverty focuses on reducing poverty and improving access to basic needs, opportunities, and social protection.",
    community:
      "Community programs may include livelihood assistance, financial support, housing initiatives, and services for vulnerable families.",
  },
  {
    number: 2,
    label: "Zero Hunger",
    color: "#DDA63A",
    description:
      "Zero Hunger focuses on ending hunger, improving nutrition, ensuring food security, and supporting sustainable agriculture.",
    community:
      "Community efforts may include feeding programs, food assistance, community gardens, nutrition programs, and support for local farmers.",
  },
  {
    number: 3,
    label: "Good Health",
    color: "#4C9F38",
    description:
      "Good Health promotes healthy lives and well-being for people of all ages through accessible and effective health services.",
    community:
      "Examples include medical missions, vaccination programs, health education, mental health support, and community wellness activities.",
  },
  {
    number: 4,
    label: "Quality Education",
    color: "#C5192D",
    description:
      "Quality Education promotes inclusive and equitable learning opportunities and encourages lifelong learning for everyone.",
    community:
      "Community initiatives may include scholarships, literacy programs, skills training, digital learning, and educational assistance.",
  },
  {
    number: 5,
    label: "Gender Equality",
    color: "#FF3A21",
    description:
      "Gender Equality promotes equal rights, opportunities, and participation for women and girls while addressing discrimination and inequality.",
    community:
      "Programs may include women's empowerment, gender awareness, livelihood opportunities, and protection against discrimination and violence.",
  },
  {
    number: 6,
    label: "Clean Water",
    color: "#26BDE2",
    description:
      "Clean Water focuses on ensuring access to safe water, sanitation, and proper hygiene while protecting water resources.",
    community:
      "Examples include clean water projects, sanitation facilities, drainage improvements, and community hygiene programs.",
  },
  {
    number: 7,
    label: "Clean Energy",
    color: "#FCC30B",
    description:
      "Clean Energy promotes affordable, reliable, sustainable, and modern energy for communities.",
    community:
      "Community projects may include solar energy systems, energy-saving programs, renewable energy projects, and improved access to electricity.",
  },
  {
    number: 8,
    label: "Decent Work",
    color: "#A21942",
    description:
      "Decent Work promotes inclusive economic growth, productive employment, fair working conditions, and opportunities for sustainable livelihoods.",
    community:
      "Examples include job training, employment programs, livelihood projects, entrepreneurship support, and small business development.",
  },
  {
    number: 9,
    label: "Industry & Innovation",
    color: "#FD6925",
    description:
      "Industry and Innovation focuses on resilient infrastructure, sustainable industries, technological development, and innovation.",
    community:
      "Community initiatives may include digital infrastructure, technology programs, improved facilities, and innovation-based projects.",
  },
  {
    number: 10,
    label: "Reduced Inequalities",
    color: "#DD1367",
    description:
      "Reduced Inequalities promotes social and economic inclusion and works toward reducing inequalities within communities.",
    community:
      "Examples include programs supporting persons with disabilities, vulnerable groups, equal access to services, and social inclusion.",
  },
  {
    number: 11,
    label: "Sustainable Cities",
    color: "#FD9D24",
    description:
      "Sustainable Cities promotes inclusive, safe, resilient, and sustainable communities and human settlements.",
    community:
      "Projects may include public transportation, housing, disaster preparedness, community infrastructure, and safer public spaces.",
  },
  {
    number: 12,
    label: "Responsible Consumption",
    color: "#BF8B2E",
    description:
      "Responsible Consumption encourages communities to use resources efficiently and reduce waste throughout production and consumption.",
    community:
      "Examples include recycling programs, waste reduction, responsible purchasing, plastic reduction, and sustainable production.",
  },
  {
    number: 13,
    label: "Climate Action",
    color: "#3F7E44",
    description:
      "Climate Action focuses on reducing the effects of climate change and strengthening communities' ability to respond to climate-related risks.",
    community:
      "Community activities may include disaster preparedness, tree planting, climate education, and environmental protection programs.",
  },
  {
    number: 14,
    label: "Life Below Water",
    color: "#0A97D9",
    description:
      "Life Below Water focuses on protecting oceans, seas, rivers, and other aquatic ecosystems and using marine resources responsibly.",
    community:
      "Examples include coastal cleanups, marine conservation, sustainable fishing, and programs that reduce pollution entering waterways.",
  },
  {
    number: 15,
    label: "Life on Land",
    color: "#56C02B",
    description:
      "Life on Land promotes the protection, restoration, and sustainable use of forests, ecosystems, and biodiversity.",
    community:
      "Community projects may include tree planting, forest conservation, wildlife protection, habitat restoration, and environmental education.",
  },
  {
    number: 16,
    label: "Peace & Justice",
    color: "#00689D",
    description:
      "Peace and Justice promotes peaceful and inclusive communities, access to justice, accountability, and effective institutions.",
    community:
      "Examples include community safety programs, legal assistance, conflict resolution, transparent governance, and peace-building activities.",
  },
  {
    number: 17,
    label: "Partnerships",
    color: "#19486A",
    description:
      "Partnerships for the Goals emphasizes collaboration between communities, governments, organizations, institutions, and other partners.",
    community:
      "Community partnerships may bring together barangays, schools, government agencies, organizations, businesses, and residents to achieve shared goals.",
  },
];

SDG_LIST.forEach((sdg, index) => {
  sdg.image = images[index];
});

function SDGModal({ sdg, onClose }) {
  if (!sdg) return null;

  return (
    <div
      className={styles.modalBackdrop}
      onClick={onClose}
    >
      <div
        className={styles.modal}
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div
          className={styles.modalHeader}
          style={{
            background: sdg.color,
          }}
        >
          <span className={styles.modalNumber}>
            SDG {sdg.number}
          </span>

          <h2 className={styles.modalTitle}>
            {sdg.label}
          </h2>

          <button
            className={styles.modalClose}
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <img
            src={sdg.image}
            alt={sdg.label}
            className={styles.modalImage}
          />

          <div className={styles.modalSection}>
            <h3>What is this goal?</h3>

            <p>
              {sdg.description}
            </p>
          </div>

          <div className={styles.modalSection}>
            <h3>Community application</h3>

            <p>
              {sdg.community}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SDGGoals() {
  const [selected, setSelected] =
    useState(null);

  return (
    <section>
      <h2 className={styles.sectionTitle}>
        The 17 Sustainable Development Goals
      </h2>

      <p className={styles.sectionSubtitle}>
        Explore each goal to understand its
        purpose and how it can support
        sustainable community development.
      </p>

      <div className={styles.grid}>
        {SDG_LIST.map((sdg) => (
          <button
            key={sdg.number}
            type="button"
            className={styles.sdgCard}
            onClick={() =>
              setSelected(sdg)
            }
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
        onClose={() =>
          setSelected(null)
        }
      />
    </section>
  );
}