import styles from "./Signup.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API = "http://localhost:5000/api/users";

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    barangay: "",
  });

  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("signup");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (step !== "otp" || resendTimer <= 0) return;

    const timer = setTimeout(() => {
      setResendTimer((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [step, resendTimer]);

  const handleChange = (e) => {
    setForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const requestOtp = async () => {
    const res = await fetch(`${API}/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        barangay: form.barangay.trim(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to send verification code.");
    }

    return data;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const data = await requestOtp();

      setOtp("");
      setStep("otp");
      setResendTimer(60);
      setMessage(data.message || "Verification code sent. Check your email.");
    } catch (err) {
      setError(err.message || "Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the six-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim(),
          otp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Email verification failed.");
      }

      setMessage(data.message || "Email verified successfully.");
      navigate("/login", {
        state: { message: "Your account was created. You can now log in." },
      });
    } catch (err) {
      setError(err.message || "Email verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError(null);
    setMessage(null);
    setResending(true);

    try {
      const data = await requestOtp();

      setOtp("");
      setResendTimer(60);
      setMessage(data.message || "A new verification code has been sent.");
    } catch (err) {
      setError(err.message || "Failed to resend verification code.");

      if (err.message?.includes("wait 60 seconds")) {
        setResendTimer(60);
      }
    } finally {
      setResending(false);
    }
  };

  const handleBack = () => {
    setStep("signup");
    setOtp("");
    setError(null);
    setMessage(null);
  };

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.leftBg} />
        <div className={styles.leftOverlay} />

        <div className={styles.leftInner}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>SDG</div>
            <span className={styles.brandName}>Smart Hub</span>
          </div>

          <div className={styles.leftContent}>
            <p className={styles.eyebrow}>City of Manila</p>

            <h1 className={styles.leftTitle}>
              Be Part of Manila&apos;s Sustainable Future
            </h1>

            <p className={styles.leftDesc}>
              Join thousands of community members working together to achieve
              the 17 Sustainable Development Goals across Manila&apos;s
              barangays.
            </p>
          </div>

          <p className={styles.leftFooter}>
            © {new Date().getFullYear()} SDG Smart Hub — Sustainable Development
            City of Manila
          </p>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              {step === "signup" ? "Create an account" : "Verify your email"}
            </h2>

            <p className={styles.cardSubtitle}>
              {step === "signup"
                ? "Join the SDG Smart Hub community"
                : `Enter the six-digit code sent to ${form.email}`}
            </p>
          </div>

          {step === "signup" ? (
            <form className={styles.form} onSubmit={handleSignup}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="fullName">
                  Full name
                </label>

                <input
                  className={styles.input}
                  id="fullName"
                  type="text"
                  name="fullName"
                  placeholder="Juan dela Cruz"
                  value={form.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">
                  Email address
                </label>

                <input
                  className={styles.input}
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="barangay">
                  Barangay
                </label>

                <input
                  className={styles.input}
                  id="barangay"
                  type="text"
                  name="barangay"
                  placeholder="e.g. Barangay 1"
                  value={form.barangay}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="password">
                    Password
                  </label>

                  <input
                    className={styles.input}
                    id="password"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="confirmPassword">
                    Confirm password
                  </label>

                  <input
                    className={styles.input}
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>
              </div>

              {error && <p className={styles.error}>{error}</p>}
              {message && <p>{message}</p>}

              <button
                className={styles.submitBtn}
                type="submit"
                disabled={loading}
              >
                {loading ? "Sending verification code…" : "Continue"}
              </button>
            </form>
          ) : (
            <form className={styles.form} onSubmit={handleVerifyOtp}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="otp">
                  Verification code
                </label>

                <input
                  className={styles.input}
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                />
              </div>

              {error && <p className={styles.error}>{error}</p>}
              {message && <p>{message}</p>}

              <button
                className={styles.submitBtn}
                type="submit"
                disabled={loading || otp.length !== 6}
              >
                {loading ? "Verifying…" : "Verify email and create account"}
              </button>

              <button
                className={styles.submitBtn}
                type="button"
                disabled={resending || resendTimer > 0}
                onClick={handleResendOtp}
              >
                {resending
                  ? "Sending new code…"
                  : resendTimer > 0
                    ? `Resend code in ${resendTimer}s`
                    : "Resend verification code"}
              </button>

              <button
                className={styles.submitBtn}
                type="button"
                disabled={loading || resending}
                onClick={handleBack}
              >
                Go back
              </button>
            </form>
          )}

          <p className={styles.loginText}>
            Already have an account?{" "}
            <Link to="/login" className={styles.loginLink}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;