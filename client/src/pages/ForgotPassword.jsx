import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./PasswordReset.module.css";

const API = "http://localhost:5000/api/users";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to process your request.");
      }

      setMessage(
        data.message ||
          "If an account exists for that email, password reset instructions will be sent."
      );
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
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
            <path
              d="M4.5 8.5 12 14l7.5-5.5M6 5.5h12A1.5 1.5 0 0 1 19.5 7v10a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 17V7A1.5 1.5 0 0 1 6 5.5Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <p className={styles.eyebrow}>ACCOUNT RECOVERY</p>
        <h1 className={styles.title}>Forgot your password?</h1>
        <p className={styles.description}>
          No worries. Enter the email address associated with your account and
          we’ll help you get back in.
        </p>

        {!message && (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="forgot-email" className={styles.label}>
                Email address
              </label>
              <input
                id="forgot-email"
                className={styles.input}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
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
                  Sending request...
                </>
              ) : (
                <>
                  Send reset link
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </form>
        )}

        {message && (
          <div className={styles.successPanel} role="status">
            <span className={styles.successIcon}>✓</span>
            <div>
              <h2>Check your email</h2>
              <p>{message}</p>
            </div>
          </div>
        )}

        <div className={styles.divider}>
          <span />
          <span>REMEMBERED YOUR PASSWORD?</span>
          <span />
        </div>

        <Link to="/login" className={styles.secondaryButton}>
          <span aria-hidden="true">←</span>
          Back to sign in
        </Link>

        <p className={styles.securityNote}>
          <span aria-hidden="true">⌑</span>
          Your account security matters to us.
        </p>
      </section>

      <footer className={styles.pageFooter}>
        © {new Date().getFullYear()} SDG Smart Hub · City of Manila
      </footer>
    </main>
  );
}

export default ForgotPassword;