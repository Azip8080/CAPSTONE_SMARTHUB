import styles from "./ProjectGrid.module.css";
import ProjectCard from "./ProjectCard.jsx";

function ProjectGrid({ loading, projects, onView, onFeatureToggle }) {
  if (loading) return <p className={styles.empty}>Loading…</p>;
  if (projects.length === 0) return <p className={styles.empty}>No projects found.</p>;

  return (
    <div className={styles.grid}>
      {projects.map((p) => (
        <ProjectCard key={p._id} project={p} onView={onView} onFeatureToggle={onFeatureToggle} />
      ))}
    </div>
  );
}

export default ProjectGrid;