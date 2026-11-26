
import { useState } from "react";
import styles from "./Submissions.module.css";
import ProjectSubmissionsTab from "./ProjectSubmissionsTab";
import EventSubmissionsTab from "./EventSubmissionsTab";

function Submissions() {
  const [tab, setTab] = useState("projects");

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            Project & Event Submissions
          </h1>

          <p className={styles.pageSubtitle}>
            Review, approve, and manage submissions from Barangay Personnel.
          </p>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tabBtn} ${
            tab === "projects" ? styles.activeTab : ""
          }`}
          onClick={() => setTab("projects")}
        >
          Project Submissions
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${
            tab === "events" ? styles.activeTab : ""
          }`}
          onClick={() => setTab("events")}
        >
          Event Submissions
        </button>
      </div>

      <div className={styles.tabContent}>
        {tab === "projects" && <ProjectSubmissionsTab />}

        {tab === "events" && <EventSubmissionsTab />}
      </div>
    </div>
  );
}

export default Submissions;
