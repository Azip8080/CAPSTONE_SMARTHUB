import { useState } from "react";
import styles from "./KnowledgeHub.module.css";
import SDGGoals from "./components/SDGGoals";
import FeaturedGuides from "./components/FeaturedGuides";

function KnowledgeHub() {
  const [sdgFilter, setSdgFilter] =
    useState("All");

  return (
    <main className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Knowledge Hub
        </h1>

        <p className={styles.heroSubtitle}>
          Learn about the 17 Sustainable
          Development Goals and discover
          resources to help your community thrive.
        </p>
      </div>

      <div className={styles.content}>
        <SDGGoals
          selectedSDG={sdgFilter}
          onSelectSDG={setSdgFilter}
        />

        <FeaturedGuides
          sdgFilter={sdgFilter}
          onSdgFilter={setSdgFilter}
        />
      </div>
    </main>
  );
}

export default KnowledgeHub;