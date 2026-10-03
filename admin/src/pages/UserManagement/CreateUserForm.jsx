import { useState } from "react";
import styles from "./EditUserForm.module.css";

function CreateUserForm({
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "admin",
    barangay: "",
  });

  const [saving, setSaving] =
    useState(false);

  const handleChange = (field, value) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      await onSubmit(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
    >
      <div className={styles.field}>
        <label className={styles.label}>
          Full Name
        </label>

        <input
          className={styles.input}
          type="text"
          value={form.fullName}
          placeholder="Enter full name"
          onChange={(e) =>
            handleChange(
              "fullName",
              e.target.value
            )
          }
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Email
        </label>

        <input
          className={styles.input}
          type="email"
          value={form.email}
          placeholder="Enter email address"
          onChange={(e) =>
            handleChange(
              "email",
              e.target.value
            )
          }
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Password
        </label>

        <input
          className={styles.input}
          type="password"
          value={form.password}
          placeholder="Enter temporary password"
          onChange={(e) =>
            handleChange(
              "password",
              e.target.value
            )
          }
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Role
        </label>

        <input
          className={styles.input}
          value="Administrator"
          disabled
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Barangay
        </label>

        <input
          className={styles.input}
          type="text"
          value={form.barangay}
          placeholder="e.g. Barangay 1"
          onChange={(e) =>
            handleChange(
              "barangay",
              e.target.value
            )
          }
        />
      </div>

      <div className={styles.modalFooter}>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={onClose}
        >
          Cancel
        </button>

        <button
          type="submit"
          className={styles.saveBtn}
          disabled={saving}
        >
          {saving
            ? "Creating…"
            : "Create account"}
        </button>
      </div>
    </form>
  );
}

export default CreateUserForm;