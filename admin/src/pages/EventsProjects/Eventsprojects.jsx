import { useState } from "react";
import styles from "./EventsProjects.module.css";
import ProjectsTab from "./ProjectsTab.jsx";
import EventsTab from "./EventsTab.jsx";

function EventsProjects() {
  const [tab, setTab] = useState("projects");

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Events & Projects</h1>
        <p className={styles.pageSubtitle}>Manage all SDG-related projects and community events</p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabBtn} ${tab === "projects" ? styles.activeTab : ""}`}
          onClick={() => setTab("projects")}
        >
          Projects
        </button>
        <button
          className={`${styles.tabBtn} ${tab === "events" ? styles.activeTab : ""}`}
          onClick={() => setTab("events")}
        >
          Events
        </button>
      </div>

      {tab === "projects" && <ProjectsTab />}
      {tab === "events" && <EventsTab />}
    </div>
  );
}

export default EventsProjects;