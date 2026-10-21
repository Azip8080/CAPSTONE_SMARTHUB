import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AuthGate.module.css";

function AuthGate({
  children,
  title = "Sign in to continue",
}) {
  const navigate = useNavigate();

  const [authenticated, setAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem("token"));
  });

  useEffect(() => {
    const checkAuth = () => {
      setAuthenticated(
        Boolean(localStorage.getItem("token"))
      );
    };

    window.addEventListener("storage", checkAuth);
    window.addEventListener("userUpdated", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("userUpdated", checkAuth);
    };
  }, []);

  if (authenticated) {
    return children;
  }

  return (
    <div className={styles.container}>
      {/* Blurred version of the actual page */}
      <div
        className={styles.blurredContent}
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Authentication overlay */}
      <div
        className={styles.overlay}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-gate-title"
      >
        <div className={styles.authCard}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>
              SDG
            </div>

            <span className={styles.brandName}>
              Smart Hub
            </span>
          </div>

          <div className={styles.cardHeader}>
            <h2
              id="auth-gate-title"
              className={styles.title}
            >
              {title}
            </h2>

            <p className={styles.subtitle}>
              Sign in to your SDG Smart Hub account
              to access this feature.
            </p>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.loginButton}
              onClick={() => navigate("/login")}
            >
              Sign in
            </button>

            <button
              type="button"
              className={styles.signupButton}
              onClick={() => navigate("/signup")}
            >
              Create an account
            </button>
          </div>

          <p className={styles.footer}>
            © {new Date().getFullYear()} SDG Smart Hub —
            City of Manila
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthGate;