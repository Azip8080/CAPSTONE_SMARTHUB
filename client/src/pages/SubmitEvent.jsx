
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEvent } from "../services/eventService";
import styles from "./SubmitEvent.module.css";

function getLocalDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const initialForm = {
  title: "",
  description: "",
  location: "",
  date: "",
  startTime: "",
  endTime: "",
  sdgTag: "",
};

function SubmitEvent() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [checkingUser, setCheckingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);

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

      if (!parsedUser.barangay?.trim()) {
        setError("Your account has no assigned barangay. Please contact the administrator.");
        return;
      }

      setUser(parsedUser);
    } catch {
      navigate("/login", { replace: true });
    } finally {
      setCheckingUser(false);
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    setError("");
    setMessage("");

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.location.trim() ||
      !form.date ||
      !form.sdgTag
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (form.date < getLocalDate()) {
      setError("The event date cannot be in the past.");
      return;
    }

    if (form.endTime && !form.startTime) {
      setError("Please provide a start time when an end time is entered.");
      return;
    }

    if (
      form.startTime &&
      form.endTime &&
      form.endTime <= form.startTime
    ) {
      setError("The event end time must be later than the start time.");
      return;
    }

    try {
      setSubmitting(true);

      await createEvent({
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        date: form.date,
        startTime: form.startTime || "",
        endTime: form.endTime || "",
        sdgTag: form.sdgTag,
      });

      setMessage(
        "Your event has been submitted successfully. It is now awaiting administrator review."
      );

      setForm({ ...initialForm });
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingUser) {
    return (
      <div className={styles.loading}>
        Loading submission form...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.heading}>
          <span className={styles.label}>BARANGAY PERSONNEL</span>
          <h1>Submit an Event</h1>
          <p>
            Share your barangay's upcoming activities, programs, and
            community events through SDG Smart Hub.
          </p>
        </header>

        <div className={styles.assignedBarangay}>
          <span>Assigned Barangay</span>
          <strong>{user.barangay}</strong>
        </div>

        {message && (
          <div className={`${styles.message} ${styles.success}`}>
            <p>{message}</p>
            <button
              type="button"
              onClick={() => navigate("/my-submissions")}
            >
              View My Submissions
            </button>
          </div>
        )}

        {error && (
          <div className={`${styles.message} ${styles.error}`}>
            {error}
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <section className={styles.section}>
            <h2>Event Information</h2>

            <div className={styles.group}>
              <label htmlFor="title">Event Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter the event title"
                maxLength={150}
                required
              />
            </div>

            <div className={styles.group}>
              <label htmlFor="description">
                Event Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the event, its purpose, and activities..."
                rows={6}
                required
              />
            </div>

            <div className={styles.group}>
              <label htmlFor="location">Event Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Enter the event venue or location"
                required
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.group}>
                <label htmlFor="date">Event Date *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  min={getLocalDate()}
                  required
                />
              </div>

              <div className={styles.group}>
                <label htmlFor="sdgTag">Related SDG *</label>
                <select
                  id="sdgTag"
                  name="sdgTag"
                  value={form.sdgTag}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select an SDG</option>
                  {Array.from({ length: 17 }, (_, index) => (
                    <option
                      key={index + 1}
                      value={`SDG ${index + 1}`}
                    >
                      SDG {index + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Event Schedule</h2>
            <p className={styles.sectionDescription}>
              Event times are optional. Leave them blank if the
              schedule has not been finalized.
            </p>

            <div className={styles.formRow}>
              <div className={styles.group}>
                <label htmlFor="startTime">Start Time</label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.group}>
                <label htmlFor="endTime">End Time</label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                  min={form.startTime || undefined}
                />
              </div>
            </div>
          </section>

          <div className={styles.reviewNotice}>
            <strong>Administrator Review Process</strong>
            <p>
              Your event will be submitted for administrator review.
              It will only become visible on the public Events page
              after it has been approved and published.
            </p>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => navigate("/")}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Event"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default SubmitEvent;
