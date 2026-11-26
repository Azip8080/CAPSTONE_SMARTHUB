
import { useCallback, useEffect, useState } from "react";
import { api } from "../../services/api";
import styles from "./EventSubmissionsTab.module.css";

const API_BASE = (
  import.meta.env.VITE_API_URL ||
  "https://sdg-smarthub-api.onrender.com/api"
).replace(/\/+$/, "");

function EventSubmissionsTab() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [rejectingEvent, setRejectingEvent] = useState(null);
  const [remarks, setRemarks] = useState("");

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/events/admin/pending");
      setEvents(response.data || []);
    } catch (err) {
      setError(err.message || "Failed to load event submissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleApprove = async (eventId) => {
    const confirmed = window.confirm(
      "Are you sure you want to approve and publish this event?"
    );

    if (!confirmed) return;

    try {
      setProcessingId(eventId);
      setError("");

      await api.patch(`/events/${eventId}/approve`, {});
      await loadEvents();
    } catch (err) {
      setError(err.message || "Failed to approve event.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!remarks.trim()) {
      setError("Please provide remarks before rejecting this event.");
      return;
    }

    try {
      setProcessingId(rejectingEvent._id);
      setError("");

      await api.patch(
        `/events/${rejectingEvent._id}/reject`,
        { remarks: remarks.trim() }
      );

      setRejectingEvent(null);
      setRemarks("");
      await loadEvents();
    } catch (err) {
      setError(err.message || "Failed to reject event.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDownload = async (event) => {
    try {
      setDownloadingId(event._id);
      setError("");

      const token =
        localStorage.getItem("adminToken") ||
        localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE}/events/${event._id}/document`,
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      );

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Your session has expired. Please log in again."
            : "Unable to download the event document."
        );
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download =
        event.document?.originalName || "event-document";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError(err.message || "Failed to download document.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        Loading event submissions...
      </div>
    );
  }

  return (
    <div className={styles.eventSubmissions}>
      <div className={styles.submissionsHeading}>
        <div>
          <h2>Event Submissions</h2>
          <p>Review events submitted by Barangay Personnel.</p>
        </div>

        <button
          type="button"
          className={styles.refreshButton}
          onClick={loadEvents}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {events.length === 0 ? (
        <div className={styles.empty}>
          <h3>No Pending Events</h3>
          <p>
            There are currently no event submissions waiting for review.
          </p>
        </div>
      ) : (
        <div className={styles.eventList}>
          {events.map((event) => {
            const targetBarangays =
              event.barangays?.length > 0
                ? event.barangays
                : event.barangay
                  ? [event.barangay]
                  : [];

            return (
              <article
                className={styles.eventCard}
                key={event._id}
              >
                <div className={styles.cardHeader}>
                  <div>
                    <span className={styles.pendingStatus}>
                      Pending Review
                    </span>
                    <h3>{event.title}</h3>
                  </div>
                </div>

                <p className={styles.description}>
                  {event.description}
                </p>

                <div className={styles.details}>
                  <p>
                    <strong>Location:</strong>{" "}
                    {event.location || "Not specified"}
                  </p>

                  <p>
                    <strong>Target Barangays:</strong>{" "}
                    {targetBarangays.length > 0
                      ? targetBarangays.join(", ")
                      : "All Barangays"}
                  </p>

                  <p>
                    <strong>Date:</strong>{" "}
                    {event.date
                      ? new Date(event.date).toLocaleDateString()
                      : "Not specified"}
                  </p>

                  <p>
                    <strong>Time:</strong>{" "}
                    {event.startTime || event.endTime
                      ? `${event.startTime || "Not specified"} – ${
                          event.endTime || "Not specified"
                        }`
                      : "Not specified"}
                  </p>

                  <p>
                    <strong>SDG:</strong>{" "}
                    {event.sdgTag || "Not specified"}
                  </p>

                  <p>
                    <strong>Submitted:</strong>{" "}
                    {event.createdAt
                      ? new Date(event.createdAt).toLocaleDateString()
                      : "Not available"}
                  </p>
                </div>

                {event.document?.path && (
                  <div className={styles.document}>
                    <div>
                      <strong>Attached Document</strong>
                      <p>
                        {event.document.originalName ||
                          "Event document"}
                      </p>
                    </div>

                    <button
                      type="button"
                      className={styles.downloadButton}
                      disabled={downloadingId === event._id}
                      onClick={() => handleDownload(event)}
                    >
                      {downloadingId === event._id
                        ? "Downloading..."
                        : "Download"}
                    </button>
                  </div>
                )}

                <div className={styles.reviewActions}>
                  <button
                    type="button"
                    className={styles.approveButton}
                    disabled={processingId === event._id}
                    onClick={() => handleApprove(event._id)}
                  >
                    {processingId === event._id
                      ? "Processing..."
                      : "Approve"}
                  </button>

                  <button
                    type="button"
                    className={styles.rejectButton}
                    disabled={processingId === event._id}
                    onClick={() => {
                      setRejectingEvent(event);
                      setRemarks("");
                      setError("");
                    }}
                  >
                    Reject
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {rejectingEvent && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3>Reject Event</h3>

            <p>
              Enter the remarks that will be shown to the submitting
              Barangay Personnel.
            </p>

            <textarea
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              placeholder="Explain why this event is being rejected..."
              rows={5}
            />

            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelButton}
                disabled={processingId === rejectingEvent._id}
                onClick={() => {
                  setRejectingEvent(null);
                  setRemarks("");
                  setError("");
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className={styles.rejectButton}
                disabled={processingId === rejectingEvent._id}
                onClick={handleReject}
              >
                {processingId === rejectingEvent._id
                  ? "Submitting..."
                  : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventSubmissionsTab;
