import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { api } from "../../services/api";

function unwrapResponse(response, key) {
  // Supports both direct JSON and common wrapped API responses.
  const payload = response?.data ?? response;

  if (key && payload?.[key] !== undefined) {
    return payload[key];
  }

  if (key && payload?.data?.[key] !== undefined) {
    return payload.data[key];
  }

  return payload?.data ?? payload;
}

export function useDashboard() {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const results = await Promise.allSettled([
        api.get("/analytics/stats"),
        api.get("/projects/admin/all"),
        api.get("/events"),
        api.get("/activity"),
      ]);

      const labels = [
        "Analytics",
        "Projects",
        "Events",
        "Activity",
      ];

      const failed = results
        .map((result, index) => ({
          result,
          label: labels[index],
        }))
        .filter(({ result }) => result.status === "rejected");

      if (failed.length > 0) {
        failed.forEach(({ result, label }) => {
          console.error(
            `[DASHBOARD ${label.toUpperCase()} ERROR]`,
            result.reason
          );
        });

        throw new Error(
          `Failed to load: ${failed
            .map(({ label }) => label)
            .join(", ")}. Check the browser Network tab.`
        );
      }

      const [
        statsRes,
        projectsRes,
        eventsRes,
        activitiesRes,
      ] = results.map((result) => result.value);

      setStats(unwrapResponse(statsRes, "stats"));

      const projectData = unwrapResponse(
        projectsRes,
        "projects"
      );

      const eventData = unwrapResponse(
        eventsRes,
        "events"
      );

      const activityData = unwrapResponse(
        activitiesRes,
        "activities"
      );

      setProjects(
        Array.isArray(projectData) ? projectData : []
      );

      setEvents(
        Array.isArray(eventData)
          ? eventData.slice(0, 5)
          : []
      );

      setActivities(
        Array.isArray(activityData)
          ? activityData
          : []
      );
    } catch (err) {
      console.error("[DASHBOARD ERROR]", err);
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    stats,
    projects,
    events,
    activities,
    loading,
    error,
    reload: loadDashboard,
  };
}