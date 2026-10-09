import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import styles from "./PasswordReset.module.css";

const API = "http://localhost:5000/api/users";

function ResetPassword() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const checks = [
    {
      label: "At least 8 characters",
      valid: newPassword.length >= 8,
    },
    {
      label: "Contains an uppercase letter",
      valid: /[A-Z]/.test(newPassword),
    },
    {
      label: "Contains a number",
      valid: /\d/.test(newPassword),
    },
  ];

  const strength = checks.filter((check) => check.valid).length;
  const strengthLabel = ["Enter a password", "Weak", "Fair", "Good"][
    newPassword ? strength : 0
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Your passwords do not match. Please try again.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Password reset failed.");
      }

      setMessage(data.message || "Your password has been updated.");
      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Unable to reset your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.backgroundShape} />
      <section className={styles.card}>
        <Link to="/" className={styles.brand}>
          <span className={styles.brandMark}>SDG</span>
          <span className={styles.brandName}>
            Smart <strong>Hub</strong>
          </span>
        </Link>

        <div className={styles.iconCircle}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect
              x="5"
              y="10"
              width="14"
              height="10"
              rx="2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            />
            <path
              d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <p className={styles.eyebrow}>SECURE YOUR ACCOUNT</p>
        <h1 className={styles.title}>
          {success ? "Password updated!" : "Create a new password"}
        </h1>
        <p className={styles.description}>
          {success
            ? "Your password has been changed. You can now sign in using your new credentials."
            : "Choose a strong password that you haven't used for this account before."}
        </p>

        {!success && (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="new-password" className={styles.label}>
                New password
              </label>
              <div className={styles.passwordWrap}>
                <input
                  id="new-password"
                  className={styles.input}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <div className={styles.strengthHeader}>
                <span>Password strength</span>
                <span
                  className={
                    strength >= 3
                      ? styles.strengthGood
                      : strength === 2
                        ? styles.strengthFair
                        : styles.strengthWeak
                  }
                >
                  {strengthLabel}
                </span>
              </div>
              <div
                className={styles.strengthTrack}
                aria-label={`Password strength: ${strengthLabel}`}
              >
                <span
                  className={`${styles.strengthFill} ${
                    strength >= 3
                      ? styles.fillGood
                      : strength === 2
                        ? styles.fillFair
                        : styles.fillWeak
                  }`}
                  style={{ width: `${(strength / 3) * 100}%` }}
                />
              </div>

              <ul className={styles.requirements}>
                {checks.map((check) => (
                  <li
                    key={check.label}
                    className={
                      check.valid
                        ? styles.requirementMet
                        : styles.requirement
                    }
                  >
                    <span>{check.valid ? "✓" : "○"}</span>
                    {check.label}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.field}>
              <label htmlFor="confirm-password" className={styles.label}>
                Confirm new password
              </label>
              <div className={styles.passwordWrap}>
                <input
                  id="confirm-password"
                  className={styles.input}
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowConfirm((value) => !value)}
                  aria-label={
                    showConfirm ? "Hide confirmation" : "Show confirmation"
                  }
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
              {confirmPassword && (
                <p
                  className={
                    confirmPassword === newPassword
                      ? styles.matchSuccess
                      : styles.matchError
                  }
                >
                  {confirmPassword === newPassword
                    ? "✓ Passwords match"
                    : "Passwords do not match"}
                </p>
              )}
            </div>

            {error && (
              <div className={styles.errorMessage} role="alert">
                <span>!</span>
                {error}
              </div>
            )}

            <button
              className={styles.primaryButton}
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  Updating password...
                </>
              ) : (
                <>
                  Update password
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </form>
        )}

        {success && (
          <div className={styles.successPanel} role="status">
            <span className={styles.successIcon}>✓</span>
            <div>
              <h2>Password reset complete</h2>
              <p>{message}</p>
            </div>
          </div>
        )}

        {success ? (
          <Link to="/login" className={styles.primaryButton}>
            Continue to sign in <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <Link to="/login" className={styles.secondaryButton}>
            <span aria-hidden="true">←</span>
            Back to sign in
          </Link>
        )}

        <p className={styles.securityNote}>
          <span aria-hidden="true">⌑</span>
          Never share your password or reset link.
        </p>
      </section>

      <footer className={styles.pageFooter}>
        © {new Date().getFullYear()} SDG Smart Hub · City of Manila
      </footer>
    </main>
  );
}

export default ResetPassword;