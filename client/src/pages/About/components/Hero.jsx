import styles from "./Hero.module.css";

function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>About the Platform</p>
        <h1 className={styles.title}>
          Empowering Manila's Communities Through Sustainable Development
        </h1>
        <p className={styles.subtitle}>
          SDG Smart Hub is an AI-integrated digital platform that bridges the gap
          between technology and community governance — making sustainable
          development goals accessible, trackable, and actionable at the local level.
        </p>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>17</span>
            <span className={styles.statLabel}>SDGs Covered</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>4</span>
            <span className={styles.statLabel}>Core Features</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>2026</span>
            <span className={styles.statLabel}>Year Founded</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;