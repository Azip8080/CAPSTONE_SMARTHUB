
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Profile.module.css";

const BASE = "http://localhost:5000/api/users";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const [infoForm, setInfoForm] = useState({
    fullName: "",
    barangay: "",
  });

  const [passForm, setPassForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${BASE}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.dispatchEvent(new Event("userUpdated"));

            if (!cancelled) {
              navigate("/login");
            }

            return;
          }

          throw new Error(
            data.message || "Unable to load your profile."
          );
        }

        const profile = data.user;

        if (!profile || !profile._id) {
          throw new Error(
            "The server returned no profile data."
          );
        }

        if (cancelled) return;

        setUser(profile);
        setInfoForm({
          fullName: profile.fullName || "",
          barangay: profile.barangay || "",
        });
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Unable to load your profile."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleInfoSave = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${BASE}/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: infoForm.fullName.trim(),
          barangay: infoForm.barangay.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Profile update failed.");
      }

      const updated = data.user || {
        ...user,
        ...infoForm,
      };

      setUser(updated);
      setInfoForm({
        fullName: updated.fullName || "",
        barangay: updated.barangay || "",
      });

      localStorage.setItem("user", JSON.stringify(updated));
      window.dispatchEvent(new Event("userUpdated"));

      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.message || "Profile update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handlePassSave = async (e) => {
    e.preventDefault();

    setError(null);
    setSuccess(null);

    if (passForm.newPassword !== passForm.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (passForm.newPassword.length < 8) {
      setError("Your new password must be at least 8 characters.");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${BASE}/${user._id}/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: passForm.currentPassword,
            newPassword: passForm.newPassword,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Password update failed."
        );
      }

      setPassForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setSuccess("Password changed successfully!");
    } catch (err) {
      setError(err.message || "Password update failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading…</div>;
  }

  if (!user) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <p className={styles.errorMsg}>
            {error || "Unable to load your profile."}
          </p>
          <button type="button" onClick={() => navigate("/")}>
            Return home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarLarge}>
            {user.fullName?.charAt(0).toUpperCase()}
          </div>

          <div className={styles.profileInfo}>
            <h1 className={styles.profileName}>
              {user.fullName}
            </h1>

            <p className={styles.profileEmail}>
              {user.email}
            </p>

            <div className={styles.profileMeta}>
              <span className={styles.roleBadge}>
                {user.role?.replace(/_/g, " ")}
              </span>

              {user.barangay && (
                <span className={styles.barangayBadge}>
                  📍 {user.barangay}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${
              activeTab === "info" ? styles.activeTab : ""
            }`}
            onClick={() => {
              setActiveTab("info");
              setError(null);
              setSuccess(null);
            }}
          >
            Edit Profile
          </button>

          <button
            type="button"
            className={`${styles.tab} ${
              activeTab === "password" ? styles.activeTab : ""
            }`}
            onClick={() => {
              setActiveTab("password");
              setError(null);
              setSuccess(null);
            }}
          >
            Change Password
          </button>
        </div>

        <div className={styles.card}>
          {success && (
            <p className={styles.successMsg}>{success}</p>
          )}

          {error && (
            <p className={styles.errorMsg}>{error}</p>
          )}

          {activeTab === "info" && (
            <form className={styles.form} onSubmit={handleInfoSave}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="fullName">
                  Full name
                </label>

                <input
                  id="fullName"
                  className={styles.input}
                  type="text"
                  value={infoForm.fullName}
                  onChange={(e) =>
                    setInfoForm({
                      ...infoForm,
                      fullName: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">
                  Email address
                </label>

                <input
                  id="email"
                  className={styles.inputDisabled}
                  type="email"
                  value={user.email || ""}
                  disabled
                />

                <p className={styles.hint}>
                  Email cannot be changed.
                </p>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="barangay">
                  Barangay
                </label>

                <input
                  id="barangay"
                  className={styles.input}
                  type="text"
                  placeholder="e.g. Barangay 1"
                  value={infoForm.barangay}
                  onChange={(e) =>
                    setInfoForm({
                      ...infoForm,
                      barangay: e.target.value,
                    })
                  }
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="role">
                  Role
                </label>

                <input
                  id="role"
                  className={styles.inputDisabled}
                  type="text"
                  value={user.role?.replace(/_/g, " ") || ""}
                  disabled
                />

                <p className={styles.hint}>
                  Role is assigned by administrators.
                </p>
              </div>

              <button
                className={styles.saveBtn}
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </form>
          )}

          {activeTab === "password" && (
            <form className={styles.form} onSubmit={handlePassSave}>
              <div className={styles.field}>
                <label
                  className={styles.label}
                  htmlFor="currentPassword"
                >
                  Current password
                </label>

                <input
                  id="currentPassword"
                  className={styles.input}
                  type="password"
                  autoComplete="current-password"
                  value={passForm.currentPassword}
                  onChange={(e) =>
                    setPassForm({
                      ...passForm,
                      currentPassword: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="newPassword">
                  New password
                </label>

                <input
                  id="newPassword"
                  className={styles.input}
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={passForm.newPassword}
                  onChange={(e) =>
                    setPassForm({
                      ...passForm,
                      newPassword: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className={styles.field}>
                <label
                  className={styles.label}
                  htmlFor="confirmPassword"
                >
                  Confirm new password
                </label>

                <input
                  id="confirmPassword"
                  className={styles.input}
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={passForm.confirmPassword}
                  onChange={(e) =>
                    setPassForm({
                      ...passForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <button
                className={styles.saveBtn}
                type="submit"
                disabled={saving}
              >
                {saving ? "Updating…" : "Update password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;