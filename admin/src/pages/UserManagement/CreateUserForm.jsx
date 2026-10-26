
import { useState } from "react";
import styles from "./EditUserForm.module.css";

function CreateUserForm({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "admin",
    barangay: "",
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);

    try {
      await onSubmit(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="fullName">
          Full Name
        </label>
        <input
          id="fullName"
          className={styles.input}
          type="text"
          value={form.fullName}
          placeholder="Enter full name"
          onChange={(e) => handleChange("fullName", e.target.value)}
          autoComplete="name"
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="email">
          Email Address
        </label>
        <input
          id="email"
          className={styles.input}
          type="email"
          value={form.email}
          placeholder="Enter email address"
          onChange={(e) => handleChange("email", e.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="password">
          Temporary Password
        </label>
        <input
          id="password"
          className={styles.input}
          type="password"
          value={form.password}
          placeholder="Enter temporary password"
          onChange={(e) => handleChange("password", e.target.value)}
          autoComplete="new-password"
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="role">
          Role
        </label>
        <input
          id="role"
          className={styles.input}
          value="Administrator"
          disabled
          readOnly
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="barangay">
          Barangay
        </label>
        <input
          id="barangay"
          className={styles.input}
          type="text"
          value={form.barangay}
          placeholder="e.g. Barangay 1"
          onChange={(e) => handleChange("barangay", e.target.value)}
        />
      </div>

      <div className={styles.modalFooter}>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={onClose}
          disabled={saving}
        >
          Cancel
        </button>

        <button
          type="submit"
          className={styles.saveBtn}
          disabled={saving}
        >
          {saving ? "Creating…" : "Create account"}
        </button>
      </div>
    </form>
  );
}

export default CreateUserForm;
