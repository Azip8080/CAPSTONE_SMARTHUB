import styles from "./Mission.module.css";

const FEATURES = [
  {
    number: "01",
    title: "SDG Dashboard",
    description:
      "An interactive dashboard that visually presents the progress of all 17 Sustainable Development Goals using charts, graphs, and key performance indicators.",
  },
  {
    number: "02",
    title: "Project Showcase",
    description:
      "Highlights successful SDG-related initiatives from barangays across District 1, promoting transparency and encouraging communities to adopt best practices.",
  },
  {
    number: "03",
    title: "Events & Participation",
    description:
      "Allows community members to discover and join SDG-related events and activities, fostering active participation in sustainability efforts.",
  },
  {
    number: "04",
    title: "Knowledge Hub",
    description:
      "Provides accessible and reliable information about all 17 SDGs, including educational content, guides, and practical tips for sustainable living.",
  },
  {
    number: "05",
    title: "AI-Powered SDG Classifier",
    description:
      "Uses natural language processing to automatically scan and analyze uploaded project documents, intelligently classifying them into their corresponding SDG categories for faster and more accurate project management.",
  },
  {
    number: "06",
    title: "Role-Based Access",
    description:
      "A secure access control system managing different user types — administrators, barangay personnel, and community members — with appropriate permissions.",
  },
];

function Mission() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>What We Do</p>
          <h2 className={styles.title}>A Platform Built for Community Impact</h2>
          <p className={styles.subtitle}>
            SDG Smart Hub integrates data analytics, AI, and community engagement
            into a single centralized platform designed to support sustainable
            development at the local level.
          </p>
        </div>

        <div className={styles.grid}>
          {FEATURES.map((f) => (
            <div key={f.number} className={styles.card}>
              <span className={styles.number}>{f.number}</span>
              <h3 className={styles.cardTitle}>{f.title}</h3>
              <p className={styles.cardDesc}>{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Mission;