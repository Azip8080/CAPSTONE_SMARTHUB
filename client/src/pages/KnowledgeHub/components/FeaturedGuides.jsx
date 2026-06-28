import styles from "./FeaturedGuides.module.css";

const GUIDES = [
  {
    id: 1,
    tag: "SDG 1",
    tagColor: "#E5243B",
    title: "Understanding No Poverty",
    description:
      "A beginner's guide to SDG 1 and how local communities can take action to reduce poverty.",
    readTime: "5 min read",
  },
  {
    id: 2,
    tag: "SDG 13",
    tagColor: "#3F7E44",
    title: "Climate Action in Your Barangay",
    description:
      "Practical steps communities in Manila can take to address climate change at the local level.",
    readTime: "7 min read",
  },
  {
    id: 3,
    tag: "SDG 11",
    tagColor: "#FD9D24",
    title: "Building Sustainable Cities",
    description:
      "How urban planning and community participation can make cities more resilient and inclusive.",
    readTime: "6 min read",
  },
];

function GuideCard({ guide }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardImage}>
        <span className={styles.cardTag} style={{ background: guide.tagColor }}>
          {guide.tag}
        </span>
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{guide.title}</h3>
        <p className={styles.cardDescription}>{guide.description}</p>
        <div className={styles.cardFooter}>
          <span className={styles.readTime}>{guide.readTime}</span>
          <button className={styles.readBtn}>Read guide →</button>
        </div>
      </div>
    </div>
  );
}

function FeaturedGuides() {
  return (
    <section>
      <h2 className={styles.sectionTitle}>Featured Guides</h2>
      <p className={styles.sectionSubtitle}>
        Curated resources to help you understand and act on the SDGs.
      </p>
      <div className={styles.grid}>
        {GUIDES.map((guide) => (
          <GuideCard key={guide.id} guide={guide} />
        ))}
      </div>
    </section>
  );
}

export default FeaturedGuides;