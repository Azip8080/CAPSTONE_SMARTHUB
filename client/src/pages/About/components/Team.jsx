import styles from "./Team.module.css";

const TEAM = [
  { name: "Banaag, Kartt Ivan R.",  role: "Developer" },
  { name: "Buño, Lyza Elaine B.",   role: "Developer" },
  { name: "Llames, Paul Jeriel Y.", role: "Developer" },
  { name: "Sunga, John Rexthern C.", role: "Developer" },
];

function Team() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>The Team</p>
          <h2 className={styles.title}>Built by Students of Universidad de Manila</h2>
          <p className={styles.subtitle}>
            This platform was developed as a capstone project for the Bachelor of
            Science in Information Technology program at the College of Computing
            Studies, Universidad de Manila, under the supervision of Ms. Christina P. Atal.
          </p>
        </div>

        <div className={styles.grid}>
          {TEAM.map((member) => (
            <div key={member.name} className={styles.card}>
              <div className={styles.avatar}>
                {member.name.charAt(0)}
              </div>
              <p className={styles.name}>{member.name}</p>
              <p className={styles.role}>{member.role}</p>
            </div>
          ))}
        </div>

        <div className={styles.adviser}>
          <p className={styles.adviserLabel}>Project Adviser</p>
          <p className={styles.adviserName}>Ms. Christina P. Atal</p>
          <p className={styles.adviserSchool}>
            College of Computing Studies, Universidad de Manila
          </p>
        </div>
      </div>
    </section>
  );
}

export default Team;