
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SubmitProject.module.css";
import { createProject } from "../services/projectService";

const SDG_OPTIONS = [
  "No Poverty",
  "Zero Hunger",
  "Good Health and Well-being",
  "Quality Education",
  "Gender Equality",
  "Clean Water and Sanitation",
  "Affordable and Clean Energy",
  "Decent Work and Economic Growth",
  "Industry, Innovation and Infrastructure",
  "Reduced Inequalities",
  "Sustainable Cities and Communities",
  "Responsible Consumption and Production",
  "Climate Action",
  "Life Below Water",
  "Life on Land",
  "Peace, Justice and Strong Institutions",
  "Partnerships for the Goals",
];

function SubmitProject() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [checkingUser, setCheckingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    sdgTag: "",
    status: "Planned",
    startDate: "",
    endDate: "",
  });

  const [additionalSDGs, setAdditionalSDGs] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [document, setDocument] = useState(null);

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
  };

  const handleSDGChange = (sdg) => {
    setAdditionalSDGs((prev) =>
      prev.includes(sdg)
        ? prev.filter((item) => item !== sdg)
        : [...prev, sdg]
    );
  };

  const handlePhotoChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length > 10) {
      setError("You can upload a maximum of 10 photos.");
      e.target.value = "";
      setPhotos([]);
      return;
    }

    setError("");
    setPhotos(selectedFiles);
  };

  const handleDocumentChange = (e) => {
    const selectedFile = e.target.files?.[0] || null;
    setDocument(selectedFile);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!form.title.trim()) {
      setError("Please enter a project title.");
      return;
    }

    if (!form.description.trim()) {
      setError("Please enter a project description.");
      return;
    }

    if (!form.sdgTag) {
      setError("Please select a primary SDG.");
      return;
    }

    if (!form.startDate) {
      setError("Please select the project start date.");
      return;
    }

    if (!form.endDate) {
      setError("Please select the project end date.");
      return;
    }

    if (form.endDate < form.startDate) {
      setError("The end date cannot be earlier than the start date.");
      return;
    }

    const allowedPhotoTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const invalidPhoto = photos.some(
      (photo) => !allowedPhotoTypes.includes(photo.type)
    );

    if (invalidPhoto) {
      setError("Photos must be JPG, PNG, or WEBP files.");
      return;
    }

    const allowedDocumentTypes = [
      "application/pdf",
      "text/plain",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (document && !allowedDocumentTypes.includes(document.type)) {
      setError("The supporting document must be PDF, TXT, or DOCX.");
      return;
    }

    const formData = new FormData();

    formData.append("title", form.title.trim());
    formData.append("description", form.description.trim());
    formData.append("sdgTag", form.sdgTag);
    formData.append("sdgTags", JSON.stringify(additionalSDGs));
    formData.append("status", form.status);
    formData.append("startDate", form.startDate);
    formData.append("endDate", form.endDate);

    photos.forEach((photo) => {
      formData.append("photos", photo);
    });

    if (document) {
      formData.append("document", document);
    }

    try {
      setSubmitting(true);

      await createProject(formData);

      setMessage(
        "Your project has been submitted successfully. It is now awaiting admin review."
      );

      setForm({
        title: "",
        description: "",
        sdgTag: "",
        status: "Planned",
        startDate: "",
        endDate: "",
      });

      setAdditionalSDGs([]);
      setPhotos([]);
      setDocument(null);

      const photoInput = window.document.getElementById("project-photos");
      const documentInput = window.document.getElementById("project-document");

      if (photoInput) photoInput.value = "";
      if (documentInput) documentInput.value = "";
    } catch (err) {
      setError(err.message || "Unable to submit your project.");
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingUser || !user) {
    return null;
  }

  return (
    <div className={styles["submit-project-page"]}>
      <div className={styles["submit-project-container"]}>
        <div className={styles["submit-project-heading"]}>
          <span className={styles["submit-project-label"]}>
            BARANGAY PERSONNEL
          </span>

          <h1>Submit a Project</h1>

          <p>
            Share your barangay's sustainable development projects with the
            SDG Smart Hub community.
          </p>
        </div>

        <div className={styles["assigned-barangay"]}>
          <span>Assigned Barangay</span>
          <strong>{user.barangay || "No barangay assigned"}</strong>
        </div>

        {message && (
          <div
            className={`${styles["submit-message"]} ${styles["success-message"]}`}
          >
            {message}

            <button
              type="button"
              onClick={() => navigate("/my-submissions")}
            >
              View My Submissions
            </button>
          </div>
        )}

        {error && (
          <div
            className={`${styles["submit-message"]} ${styles["error-message"]}`}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className={styles["submit-project-form"]}
        >
          <div className={styles["form-section"]}>
            <h2>Project Information</h2>

            <div className={styles["form-group"]}>
              <label htmlFor="title">Project Title *</label>
              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter the project title"
                maxLength={150}
                required
              />
            </div>

            <div className={styles["form-group"]}>
              <label htmlFor="description">Project Description *</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the project, its objectives, and its expected impact..."
                rows={6}
                required
              />
            </div>

            <div className={styles["form-row"]}>
              <div className={styles["form-group"]}>
                <label htmlFor="sdgTag">Primary SDG *</label>

                <select
                  id="sdgTag"
                  name="sdgTag"
                  value={form.sdgTag}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select primary SDG</option>

                  {SDG_OPTIONS.map((sdg, index) => (
                    <option key={sdg} value={`SDG ${index + 1}`}>
                      SDG {index + 1} - {sdg}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles["form-group"]}>
                <label htmlFor="status">Project Status *</label>

                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  required
                >
                  <option value="Planned">Planned</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className={styles["form-row"]}>
              <div className={styles["form-group"]}>
                <label htmlFor="startDate">Project Start Date *</label>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange}
                  max={form.endDate || undefined}
                  required
                />
              </div>

              <div className={styles["form-group"]}>
                <label htmlFor="endDate">Project End Date *</label>
                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={handleChange}
                  min={form.startDate || undefined}
                  required
                />
              </div>
            </div>

            <p className={styles["form-help"]}>
              Select the expected start and completion dates of your project.
            </p>

            <div className={styles["form-group"]}>
              <label>Additional SDG Tags</label>

              <p className={styles["form-help"]}>
                Select other SDGs connected to this project.
              </p>

              <div className={styles["sdg-checkbox-grid"]}>
                {SDG_OPTIONS.map((sdg, index) => {
                  const value = `SDG ${index + 1}`;

                  return (
                    <label
                      className={styles["sdg-checkbox"]}
                      key={value}
                    >
                      <input
                        type="checkbox"
                        checked={additionalSDGs.includes(value)}
                        onChange={() => handleSDGChange(value)}
                      />

                      <span>{value}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={styles["form-section"]}>
            <h2>Project Attachments</h2>

            <div className={styles["form-group"]}>
              <label htmlFor="project-photos">Project Photos</label>

              <input
                id="project-photos"
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                multiple
                onChange={handlePhotoChange}
              />

              <p className={styles["form-help"]}>
                Upload up to 10 photos. Accepted formats: JPG, PNG, WEBP.
              </p>

              {photos.length > 0 && (
                <p className={styles["selected-files"]}>
                  {photos.length} photo(s) selected
                </p>
              )}
            </div>

            <div className={styles["form-group"]}>
              <label htmlFor="project-document">
                Supporting Document
              </label>

              <input
                id="project-document"
                type="file"
                accept=".pdf,.txt,.docx"
                onChange={handleDocumentChange}
              />

              <p className={styles["form-help"]}>
                Optional. Accepted formats: PDF, TXT, DOCX.
              </p>

              {document && (
                <p className={styles["selected-files"]}>
                  Selected: {document.name}
                </p>
              )}
            </div>
          </div>

          <div className={styles["submission-notice"]}>
            <strong>Review Process</strong>

            <p>
              After submission, your project will be marked as Pending Review.
              An administrator must approve it before it appears publicly on
              the SDG Smart Hub.
            </p>
          </div>

          <div className={styles["submit-project-actions"]}>
            <button
              type="button"
              className={styles["cancel-submit-btn"]}
              onClick={() => navigate("/")}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={styles["submit-project-btn"]}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SubmitProject;
