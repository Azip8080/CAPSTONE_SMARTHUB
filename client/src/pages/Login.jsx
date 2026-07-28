import styles from "./Login.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Login() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid credentials");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("userUpdated")); // add this line
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>

      {/* Left — Form */}
      <div className={styles.left}>
        <div className={styles.card}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>SDG</div>
            <span className={styles.brandName}>Smart Hub</span>
          </div>

          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Welcome back</h2>
            <p className={styles.cardSubtitle}>Sign in to your account to continue</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label}>Email address</label>
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
              <div className={styles.labelRow}>
                <label className={styles.label}>Password</label>
                <Link to="/#" className={styles.forgotLink}>Forgot password?</Link>
              </div>
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

            {error && <p className={styles.error}>{error}</p>}

            <button className={styles.submitBtn} type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className={styles.signupText}>
            Don't have an account?{" "}
            <Link to="/signup" className={styles.signupLink}>Create one</Link>
          </p>

          <p className={styles.footer}>
            © {new Date().getFullYear()} SDG Smart Hub — City of Manila
          </p>
        </div>
      </div>

      {/* Right — BG Image */}
      <div className={styles.right}>
        <div className={styles.rightBg} />
        <div className={styles.rightOverlay} />
        <div className={styles.rightContent}>
          <p className={styles.eyebrow}>Sustainable Development City of Manila</p>
          <h1 className={styles.rightTitle}>
            Tracking Progress Across All 17 SDGs
          </h1>
          <p className={styles.rightDesc}>
            A centralized platform connecting communities, barangays, and
            organizations toward a sustainable Manila.
          </p>
        </div>
      </div>

    </div>
  );
}

export default Login;