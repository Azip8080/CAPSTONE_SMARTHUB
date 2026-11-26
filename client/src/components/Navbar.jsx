
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import SDGIMG from "../assets/438-4388580_un-sustainable-development-goals-circle-hd-png-download-removebg-preview.png";

const API_BASE = (
  import.meta.env.VITE_API_URL ||
  "https://sdg-smarthub-api.onrender.com/api"
).replace(/\/+$/, "");

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dropdown, setDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navRef = useRef(null);

  const isBarangayPersonnel =
    user?.role === "barangay_personnel";

  const getRoleLabel = () => {
    if (user?.role === "admin") return "Administrator";
    if (isBarangayPersonnel) return "Barangay Personnel";
    if (user?.role === "community_member") return "Community Member";
    return "User";
  };

  useEffect(() => {
    const syncUser = () => {
      try {
        const stored = localStorage.getItem("user");
        setUser(stored ? JSON.parse(stored) : null);
      } catch {
        setUser(null);
      }
    };

    syncUser();

    window.addEventListener("userUpdated", syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("userUpdated", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setDropdown(false);
        setMobileMenuOpen(false);
      }
    }

    function handleEscape(e) {
      if (e.key === "Escape") {
        setDropdown(false);
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setDropdown(false);
  };

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    const token = localStorage.getItem("token");

    try {
      if (token) {
        await fetch(`${API_BASE}/users/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout audit request failed:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setUser(null);
      closeMobileMenu();
      setLoggingOut(false);

      window.dispatchEvent(new Event("userUpdated"));
      window.dispatchEvent(new Event("authChange"));

      navigate("/");
    }
  };

  return (
    <nav className="navbar" ref={navRef}>
      <div className="navbar-inner">
        <Link
          to="/"
          className="navbar-brand"
          onClick={closeMobileMenu}
        >
          <img
            src={SDGIMG}
            className="navbar-logo"
            alt="SDG Logo"
          />

          <span className="navbar-title">
            SDG Smart Hub
          </span>
        </Link>

        <button
          type="button"
          className={`navbar-hamburger ${mobileMenuOpen ? "open" : ""}`}
          aria-label={
            mobileMenuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={mobileMenuOpen}
          onClick={() => {
            setMobileMenuOpen((open) => !open);
            setDropdown(false);
          }}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`navbar-menu ${mobileMenuOpen ? "open" : ""}`}>
          <div className="navbar-links">
            <Link to="/highlights" className="nav-link" onClick={closeMobileMenu}>
              SDG Highlights
            </Link>

            <Link to="/events" className="nav-link" onClick={closeMobileMenu}>
              Events
            </Link>

            <Link to="/knowledge" className="nav-link" onClick={closeMobileMenu}>
              Knowledge Hub
            </Link>

            <Link to="/about" className="nav-link" onClick={closeMobileMenu}>
              About
            </Link>
          </div>

          <div className="navbar-auth">
            {user ? (
              <>
                <div className="navbar-user">
                  <button
                    className="navbar-avatar-btn"
                    onClick={() => setDropdown((open) => !open)}
                    aria-expanded={dropdown}
                    type="button"
                  >
                    <div className="navbar-avatar">
                      {user.fullName?.charAt(0).toUpperCase() || "U"}
                    </div>

                    <span className="navbar-username">
                      {user.fullName?.split(" ")[0] || "Account"}
                    </span>

                    <span className="navbar-chevron">
                      {dropdown ? "▴" : "▾"}
                    </span>
                  </button>

                  {dropdown && (
                    <div className="navbar-dropdown">
                      <div className="dropdown-header">
                        <div className="dropdown-avatar">
                          {user.fullName?.charAt(0).toUpperCase() || "U"}
                        </div>

                        <div className="dropdown-info">
                          <p className="dropdown-name">{user.fullName}</p>
                          <p className="dropdown-email">{user.email}</p>

                          {isBarangayPersonnel && (
                            <p className="dropdown-email">
                              {user.barangay || "No assigned barangay"}
                            </p>
                          )}

                          <p className="dropdown-role">{getRoleLabel()}</p>
                        </div>
                      </div>

                      <div className="dropdown-divider" />

                      <Link
                        to="/profile"
                        className="dropdown-item"
                        onClick={closeMobileMenu}
                      >
                        View Profile
                      </Link>

                      <button
                        className="dropdown-item dropdown-logout"
                        onClick={handleLogout}
                        type="button"
                        disabled={loggingOut}
                      >
                        {loggingOut ? "Signing Out..." : "Sign Out"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="navbar-mobile-user">
                  <div className="mobile-user-info">
                    <div className="navbar-avatar">
                      {user.fullName?.charAt(0).toUpperCase() || "U"}
                    </div>

                    <div>
                      <p className="mobile-user-name">{user.fullName}</p>
                      <p className="mobile-user-email">{user.email}</p>

                      {isBarangayPersonnel && (
                        <p className="mobile-user-email">
                          {user.barangay || "No assigned barangay"}
                        </p>
                      )}

                      <p className="mobile-user-email">{getRoleLabel()}</p>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    className="mobile-menu-link"
                    onClick={closeMobileMenu}
                  >
                    View Profile
                  </Link>

                  <button
                    className="mobile-menu-logout"
                    onClick={handleLogout}
                    type="button"
                    disabled={loggingOut}
                  >
                    {loggingOut ? "Signing Out..." : "Sign Out"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-signin" onClick={closeMobileMenu}>
                  Sign In
                </Link>

                <Link to="/signup" className="nav-signup" onClick={closeMobileMenu}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
