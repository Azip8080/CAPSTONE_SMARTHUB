import styles from "./TechStack.module.css";

const STACK = [
  { name: "React",      category: "Frontend",  desc: "UI library for building interactive interfaces" },
  { name: "Vite",       category: "Frontend",  desc: "Fast build tool and development server" },
  { name: "Node.js",    category: "Backend",   desc: "JavaScript runtime for server-side logic" },
  { name: "Express",    category: "Backend",   desc: "Minimal web framework for building APIs" },
  { name: "MongoDB",    category: "Database",  desc: "NoSQL database for flexible data storage" },
  { name: "Chart.js",   category: "Analytics", desc: "Library for rendering interactive data charts" },
];

const CATEGORY_COLORS = {
  Frontend:  { bg: "#dbeafe", color: "#1d4ed8" },
  Backend:   { bg: "#dcfce7", color: "#166534" },
  Database:  { bg: "#fef3c7", color: "#92400e" },
  Analytics: { bg: "#f3e8ff", color: "#7e22ce" },
};

function TechStack() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Technology</p>
          <h2 className={styles.title}>Built with Modern Web Technologies</h2>
          <p className={styles.subtitle}>
            The platform leverages a modern full-stack JavaScript architecture
            to deliver a fast, scalable, and maintainable system.
          </p>
        </div>

        <div className={styles.grid}>
          {STACK.map((tech) => {
            const cat = CATEGORY_COLORS[tech.category];
            return (
              <div key={tech.name} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.techName}>{tech.name}</span>
                  <span
                    className={styles.category}
                    style={{ background: cat.bg, color: cat.color }}
                  >
                    {tech.category}
                  </span>
                </div>
                <p className={styles.desc}>{tech.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default TechStack;