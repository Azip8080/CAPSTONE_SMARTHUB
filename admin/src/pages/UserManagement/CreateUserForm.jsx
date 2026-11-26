
import { useState } from "react";
import styles from "./EditUserForm.module.css";

function CreateUserForm({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "barangay_personnel",
    barangay: "",
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "role" && value === "admin" ? { barangay: "" } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (
      form.role === "barangay_personnel" &&
      !form.barangay.trim()
    ) {
      alert("Please enter the assigned barangay.");
      return;
    }

    setSaving(true);

    try {
      await onSubmit({
        ...form,
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        barangay:
          form.role === "barangay_personnel"
            ? form.barangay.trim()
            : "",
      });
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
          minLength={8}
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="role">
          Account Role
        </label>
        <select
          id="role"
          className={styles.input}
          value={form.role}
          onChange={(e) => handleChange("role", e.target.value)}
          required
        >
          <option value="admin">Admin</option>
          <option value="barangay_personnel">Barangay Personnel</option>
        </select>
      </div>

      {form.role === "barangay_personnel" && (
        <div className={styles.field}>
          <label className={styles.label} htmlFor="barangay">
            Assigned Barangay
          </label>
          <input
            id="barangay"
            className={styles.input}
            type="text"
            value={form.barangay}
            placeholder="Enter barangay name"
            onChange={(e) => handleChange("barangay", e.target.value)}
            required
          />
        </div>
      )}

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
          {saving
            ? "Creating..."
            : form.role === "admin"
              ? "Create Admin Account"
              : "Create Personnel Account"}
        </button>
      </div>
    </form>
  );
}

export default CreateUserForm;
