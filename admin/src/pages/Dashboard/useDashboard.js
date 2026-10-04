import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { api } from "../../services/api";

export function useDashboard() {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [activities, setActivities] =
    useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const [
          statsRes,
          projectsRes,
          eventsRes,
          activitiesRes,
        ] = await Promise.all([
          api.get("/analytics/stats"),
          api.get("/projects/admin/all"),
          api.get("/events"),
          api.get("/activity"),
        ]);

        setStats(statsRes.data);

        const projectData =
          projectsRes.data?.data ??
          projectsRes.data ??
          projectsRes;

        const eventData =
          eventsRes.data?.data ??
          eventsRes.data ??
          eventsRes;

        const activityData =
          activitiesRes.data?.data ??
          activitiesRes.data ??
          activitiesRes;

        setProjects(
          Array.isArray(projectData)
            ? projectData
            : []
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
        console.error(
          "[DASHBOARD ERROR]",
          err
        );

        setError(
          "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

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