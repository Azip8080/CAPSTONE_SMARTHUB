
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MySubmissions.module.css";

const API_BASE = (
  import.meta.env.VITE_API_URL ||
  "https://sdg-smarthub-api.onrender.com/api"
).replace(/\/+$/, "");

function MySubmissions() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("projects");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;

      if (
        !token ||
        !parsedUser ||
        parsedUser.role !== "barangay_personnel"
      ) {
        navigate("/login", { replace: true });
        return;
      }

      setUser(parsedUser);
    } catch {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const fetchSubmissions = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setLoading(true);
      setError("");

      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      };

      const [projectResponse, eventResponse] = await Promise.all([
        fetch(`${API_BASE}/projects/my-submissions`, { headers }),
        fetch(`${API_BASE}/events/my-submissions`, { headers }),
      ]);

      const projectData = await projectResponse.json().catch(() => ({}));
      const eventData = await eventResponse.json().catch(() => ({}));

      if (!projectResponse.ok) {
        throw new Error(
          projectData.message || "Unable to load project submissions."
        );
      }

      if (!eventResponse.ok) {
        throw new Error(
          eventData.message || "Unable to load event submissions."
        );
      }

      const projectList = Array.isArray(projectData)
        ? projectData
        : projectData.data || [];

      const eventList = Array.isArray(eventData)
        ? eventData
        : eventData.data || [];

      setProjects(projectList);
      setEvents(eventList);
    } catch (err) {
      setError(err.message || "Unable to load your submissions.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user, fetchSubmissions]);

  const getStatusClass = (item) => {
    const status = item.reviewStatus || item.status;

    if (status === "Approved") {
      return styles["status-approved"];
    }

    if (status === "Rejected") {
      return styles["status-rejected"];
    }

    return styles["status-pending"];
  };

  const getStatusLabel = (item) => {
    return item.reviewStatus || "Pending Review";
  };

  const formatDate = (date) => {
    if (!date) return "Date not specified";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date not specified";
    }

    return parsedDate.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderSubmission = (item, type) => {
    const isProject = type === "project";

    return (
      <article
        className={styles["submission-card"]}
        key={item._id}
      >
        <div className={styles["submission-card-top"]}>
          <span
            className={`${styles["submission-type"]} ${
              isProject
                ? styles["project-type"]
                : styles["event-type"]
            }`}
          >
            {isProject ? "PROJECT" : "EVENT"}
          </span>

          <span
            className={`${styles["submission-status"]} ${getStatusClass(item)}`}
          >
            {getStatusLabel(item)}
          </span>
        </div>

        <h3>{item.title}</h3>

        <p className={styles["submission-description"]}>
          {item.description || "No description provided."}
        </p>

        <div className={styles["submission-details"]}>
          {isProject ? (
            <>
              <span>
                <strong>Primary SDG:</strong>{" "}
                {item.sdgTag || "Not specified"}
              </span>

              <span>
                <strong>Project Status:</strong>{" "}
                {item.status || "Not specified"}
              </span>
            </>
          ) : (
            <>
              <span>
                <strong>Location:</strong>{" "}
                {item.location || "Not specified"}
              </span>

              <span>
                <strong>Event Date:</strong>{" "}
                {formatDate(item.date)}
              </span>

              <span>
                <strong>SDG:</strong>{" "}
                {item.sdgTag || "Not specified"}
              </span>
            </>
          )}

          <span>
            <strong>Submitted:</strong>{" "}
            {formatDate(item.createdAt)}
          </span>
        </div>

        <div className={styles["submission-review"]}>
          <strong>Administrator Remarks</strong>

          <p>
            {item.reviewRemarks?.trim()
              ? item.reviewRemarks
              : item.reviewStatus === "Approved"
                ? "Your submission has been approved."
                : item.reviewStatus === "Rejected"
                  ? "No additional remarks provided."
                  : "Your submission is waiting for administrator review."}
          </p>
        </div>
      </article>
    );
  };

  if (!user) return null;

  const displayedItems =
    activeTab === "projects" ? projects : events;

  const allSubmissions = [...projects, ...events];

  return (
    <div className={styles["my-submissions-page"]}>
      <div className={styles["my-submissions-container"]}>
        <div className={styles["my-submissions-heading"]}>
          <span className={styles["my-submissions-label"]}>
            BARANGAY PERSONNEL
          </span>

          <h1>My Submissions</h1>

          <p>
            Track the projects and events you have submitted and
            check their administrator review status.
          </p>
        </div>

        <div className={styles["my-submissions-barangay"]}>
          <span>Assigned Barangay</span>
          <strong>
            {user.barangay || "No barangay assigned"}
          </strong>
        </div>

        <div className={styles["submission-summary"]}>
          <div className={styles["summary-box"]}>
            <span>Total Projects</span>
            <strong>{projects.length}</strong>
          </div>

          <div className={styles["summary-box"]}>
            <span>Total Events</span>
            <strong>{events.length}</strong>
          </div>

          <div className={styles["summary-box"]}>
            <span>Pending Review</span>
            <strong>
              {allSubmissions.filter(
                (item) =>
                  !item.reviewStatus ||
                  item.reviewStatus === "Pending Review"
              ).length}
            </strong>
          </div>

          <div className={styles["summary-box"]}>
            <span>Approved</span>
            <strong>
              {allSubmissions.filter(
                (item) => item.reviewStatus === "Approved"
              ).length}
            </strong>
          </div>
        </div>

        <div className={styles["submissions-toolbar"]}>
          <div className={styles["submission-tabs"]}>
            <button
              type="button"
              className={
                activeTab === "projects" ? styles.active : ""
              }
              onClick={() => setActiveTab("projects")}
            >
              Projects ({projects.length})
            </button>

            <button
              type="button"
              className={
                activeTab === "events" ? styles.active : ""
              }
              onClick={() => setActiveTab("events")}
            >
              Events ({events.length})
            </button>
          </div>

          <button
            type="button"
            className={styles["refresh-submissions-btn"]}
            onClick={fetchSubmissions}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className={styles["submissions-error"]}>
            {error}

            <button
              type="button"
              onClick={fetchSubmissions}
            >
              Try Again
            </button>
          </div>
        )}

        {loading ? (
          <div className={styles["submissions-empty"]}>
            Loading your submissions...
          </div>
        ) : displayedItems.length === 0 ? (
          <div className={styles["submissions-empty"]}>
            <h3>No submissions yet</h3>

            <p>
              You have not submitted any{" "}
              {activeTab === "projects" ? "projects" : "events"} yet.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  activeTab === "projects"
                    ? "/submit-project"
                    : "/submit-event"
                )
              }
            >
              Submit{" "}
              {activeTab === "projects" ? "a Project" : "an Event"}
            </button>
          </div>
        ) : (
          <div className={styles["submissions-list"]}>
            {displayedItems.map((item) =>
              renderSubmission(
                item,
                activeTab === "projects" ? "project" : "event"
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MySubmissions;
