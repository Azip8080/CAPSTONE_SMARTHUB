import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AuthGate.module.css";

function AuthGate({
  children,
  title = "Sign in to continue",
}) {
  const navigate = useNavigate();

  const [authenticated, setAuthenticated] =
    useState(() => {
      return Boolean(
        localStorage.getItem("token")
      );
    });

  useEffect(() => {
    const checkAuth = () => {
      setAuthenticated(
        Boolean(localStorage.getItem("token"))
      );
    };

    window.addEventListener(
      "storage",
      checkAuth
    );

    window.addEventListener(
      "userUpdated",
      checkAuth
    );

    return () => {
      window.removeEventListener(
        "storage",
        checkAuth
      );

      window.removeEventListener(
        "userUpdated",
        checkAuth
      );
    };
  }, []);

  if (authenticated) {
    return children;
  }

  return (
    <div className={styles.container}>
      <div
        className={styles.blurredContent}
        aria-hidden="true"
      >
        {children}
      </div>

      <div
        className={styles.overlay}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-gate-title"
      >
        <div className={styles.authCard}>
          <div
            className={styles.lockIcon}
            aria-hidden="true"
          >
            🔒
          </div>

          <h3 id="auth-gate-title">
            {title}
          </h3>

          <p>
            Please sign in to your SDG Smart Hub
            account to access this feature.
          </p>

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
      </div>
    </div>
  );
}

export default AuthGate;