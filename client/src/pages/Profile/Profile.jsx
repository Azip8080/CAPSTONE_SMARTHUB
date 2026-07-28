import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Profile.module.css";

const BASE = "http://localhost:5000/api/users";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser]           = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [success, setSuccess]     = useState(null);
  const [error, setError]         = useState(null);

  const [infoForm, setInfoForm] = useState({ fullName: "", barangay: "" });
  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    fetch(`${BASE}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setUser(data.data);
        setInfoForm({ fullName: data.data.fullName, barangay: data.data.barangay || "" });
      })
      .catch(() => navigate("/login"))
      .finally(() => setLoading(false));
  }, []);

  const handleInfoSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE}/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(infoForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      const updated = { ...user, ...infoForm };
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePassSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (passForm.newPassword !== passForm.confirmPassword) {
      return setError("New passwords do not match");
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE}/${user._id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          currentPassword: passForm.currentPassword,
          newPassword: passForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Password update failed");
      setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSuccess("Password changed successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading…</div>;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarLarge}>
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div className={styles.profileInfo}>
            <h1 className={styles.profileName}>{user?.fullName}</h1>
            <p className={styles.profileEmail}>{user?.email}</p>
            <div className={styles.profileMeta}>
              <span className={styles.roleBadge}>{user?.role?.replace("_", " ")}</span>
              {user?.barangay && (
                <span className={styles.barangayBadge}>📍 {user?.barangay}</span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "info" ? styles.activeTab : ""}`}
            onClick={() => { setActiveTab("info"); setError(null); setSuccess(null); }}
          >
            Edit Profile
          </button>
          <button
            className={`${styles.tab} ${activeTab === "password" ? styles.activeTab : ""}`}
            onClick={() => { setActiveTab("password"); setError(null); setSuccess(null); }}
          >
            Change Password
          </button>
        </div>

        <div className={styles.card}>
          {success && <p className={styles.successMsg}>{success}</p>}
          {error   && <p className={styles.errorMsg}>{error}</p>}

          {activeTab === "info" && (
            <form className={styles.form} onSubmit={handleInfoSave}>
              <div className={styles.field}>
                <label className={styles.label}>Full name</label>
                <input className={styles.input} type="text" value={infoForm.fullName}
                  onChange={(e) => setInfoForm({ ...infoForm, fullName: e.target.value })} required />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Email address</label>
                <input className={styles.inputDisabled} type="email" value={user?.email} disabled />
                <p className={styles.hint}>Email cannot be changed</p>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Barangay</label>
                <input className={styles.input} type="text" placeholder="e.g. Barangay 1"
                  value={infoForm.barangay} onChange={(e) => setInfoForm({ ...infoForm, barangay: e.target.value })} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Role</label>
                <input className={styles.inputDisabled} type="text" value={user?.role?.replace("_", " ")} disabled />
                <p className={styles.hint}>Role is assigned by administrators</p>
              </div>
              <button className={styles.saveBtn} type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </button>
            </form>
          )}

          {activeTab === "password" && (
            <form className={styles.form} onSubmit={handlePassSave}>
              <div className={styles.field}>
                <label className={styles.label}>Current password</label>
                <input className={styles.input} type="password" placeholder="••••••••"
                  value={passForm.currentPassword} onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })} required />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>New password</label>
                <input className={styles.input} type="password" placeholder="••••••••"
                  value={passForm.newPassword} onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })} required />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Confirm new password</label>
                <input className={styles.input} type="password" placeholder="••••••••"
                  value={passForm.confirmPassword} onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })} required />
              </div>
              <button className={styles.saveBtn} type="submit" disabled={saving}>
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