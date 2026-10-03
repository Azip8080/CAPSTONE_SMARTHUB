import styles from "./Signup.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

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
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (step !== "otp" || resendTimer <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setResendTimer((current) => current - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [step, resendTimer]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/users/send-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: form.fullName,
            email: form.email,
            password: form.password,
            barangay: form.barangay,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Failed to send verification code."
        );
      }

      setOtp("");
      setResendTimer(60);
      setStep("otp");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    setError(null);

    if (otp.length !== 6) {
      setError(
        "Enter the 6-digit verification code."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/users/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: form.email,
            otp,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Verification failed."
        );
      }

      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || resending) {
      return;
    }

    setError(null);
    setResending(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/users/send-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: form.fullName,
            email: form.email,
            password: form.password,
            barangay: form.barangay,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Failed to resend verification code."
        );
      }

      setOtp("");
      setResendTimer(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(value);
  };

  const handleBack = () => {
    setStep("signup");
    setOtp("");
    setError(null);
    setResendTimer(60);
  };

  return (
    <div className={styles.page}>

      <div className={styles.left}>
        <div className={styles.leftBg} />
        <div className={styles.leftOverlay} />

        <div className={styles.leftInner}>

          <div className={styles.brand}>
            <div className={styles.brandIcon}>
              SDG
            </div>

            <span className={styles.brandName}>
              Smart Hub
            </span>
          </div>

          <div className={styles.leftContent}>

            <p className={styles.eyebrow}>
              City of Manila
            </p>

            <h1 className={styles.leftTitle}>
              Be Part of Manila's Sustainable Future
            </h1>

            <p className={styles.leftDesc}>
              Join thousands of community members
              working together to achieve the 17
              Sustainable Development Goals across
              Manila's barangays.
            </p>

          </div>

          <p className={styles.leftFooter}>
            © {new Date().getFullYear()} SDG Smart Hub —
            Sustainable Development City of Manila
          </p>

        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.card}>

          {step === "signup" ? (
            <>
              <div className={styles.cardHeader}>

                <h2 className={styles.cardTitle}>
                  Create an account
                </h2>

                <p className={styles.cardSubtitle}>
                  Join the SDG Smart Hub community
                </p>

              </div>

              <form
                className={styles.form}
                onSubmit={handleSignup}
              >

                <div className={styles.field}>
                  <label className={styles.label}>
                    Full name
                  </label>

                  <input
                    className={styles.input}
                    type="text"
                    name="fullName"
                    placeholder="Juan dela Cruz"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    Email address
                  </label>

                  <input
                    className={styles.input}
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    Barangay
                  </label>

                  <input
                    className={styles.input}
                    type="text"
                    name="barangay"
                    placeholder="e.g. Barangay 1"
                    value={form.barangay}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.row}>

                  <div className={styles.field}>
                    <label className={styles.label}>
                      Password
                    </label>

                    <input
                      className={styles.input}
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>
                      Confirm password
                    </label>

                    <input
                      className={styles.input}
                      type="password"
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>

                </div>

                {error && (
                  <p className={styles.error}>
                    {error}
                  </p>
                )}

                <button
                  className={styles.submitBtn}
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Sending code…"
                    : "Continue"}
                </button>

              </form>

              <p className={styles.loginText}>
                Already have an account?{" "}
                <Link
                  to="/login"
                  className={styles.loginLink}
                >
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <>
              <div className={styles.cardHeader}>

                <h2 className={styles.cardTitle}>
                  Verify your email
                </h2>

                <p className={styles.cardSubtitle}>
                  We sent a 6-digit verification
                  code to {form.email}
                </p>

              </div>

              <form
                className={styles.form}
                onSubmit={handleVerify}
              >

                <div className={styles.field}>
                  <label className={styles.label}>
                    Verification code
                  </label>

                  <input
                    className={styles.input}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={handleOtpChange}
                    required
                  />
                </div>

                {error && (
                  <p className={styles.error}>
                    {error}
                  </p>
                )}

                <button
                  className={styles.submitBtn}
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Verifying…"
                    : "Verify email"}
                </button>

              </form>

              <div className={styles.loginText}>
                {resendTimer > 0 ? (
                  <span>
                    Resend code in {resendTimer}s
                  </span>
                ) : (
                  <button
                    type="button"
                    className={styles.loginLink}
                    onClick={handleResend}
                    disabled={resending}
                  >
                    {resending
                      ? "Sending…"
                      : "Resend code"}
                  </button>
                )}
              </div>

              <p className={styles.loginText}>
                Entered the wrong email?{" "}

                <button
                  type="button"
                  className={styles.loginLink}
                  onClick={handleBack}
                >
                  Go back
                </button>
              </p>
            </>
          )}

        </div>
      </div>

    </div>
  );
}

export default Signup;