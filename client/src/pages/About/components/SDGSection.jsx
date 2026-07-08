import styles from "./SDGSection.module.css";

function SDGSection() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.text}>
          <p className={styles.eyebrow}>Our Foundation</p>
          <h2 className={styles.title}>
            Grounded in the UN's 17 Sustainable Development Goals
          </h2>
          <p className={styles.desc}>
            The United Nations' 2030 Agenda for Sustainable Development provides
            a shared blueprint for peace and prosperity for people and the planet.
            SDG Smart Hub is built around all 17 goals, providing tools for
            communities to monitor, engage, and contribute to each one at the
            local level.
          </p>
          <p className={styles.desc}>
            From eliminating poverty and hunger to promoting clean energy and
            climate action, the platform enables barangays and organizations in
            District 1 to align their initiatives with internationally recognized
            benchmarks and track their progress meaningfully.
          </p>
          <a
            href="https://sdgs.un.org/goals"
            target="_blank"
            rel="noreferrer"
            className={styles.link}
          >
            Learn more about the SDGs →
          </a>
        </div>

        <div className={styles.visual}>
          <div className={styles.goalGrid}>
            {Array.from({ length: 17 }, (_, i) => i + 1).map((n) => (
              <img
                key={n}
                src={`/src/assets/${n}.jpg`}
                alt={`SDG ${n}`}
                className={styles.goalImg}
              />
            ))}
          </div>
          <p className={styles.visualCaption}>All 17 SDGs are covered by this platform</p>
        </div>
      </div>
    </section>
  );
}

export default SDGSection;