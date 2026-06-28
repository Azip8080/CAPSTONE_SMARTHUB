import styles from "./KnowledgeHub.module.css";
import SDGGoals from "./components/SDGGoals";
import FeaturedGuides from "./components/FeaturedGuides";

function KnowledgeHub() {
  return (
    <main className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Knowledge Hub</h1>
        <p className={styles.heroSubtitle}>
          Learn about the 17 Sustainable Development Goals and discover
          resources to help your community thrive.
        </p>
      </div>

      <div className={styles.content}>
        <SDGGoals />
        <FeaturedGuides />
      </div>
    </main>
  );
}

export default KnowledgeHub;