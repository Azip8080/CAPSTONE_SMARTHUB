import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import SDGIMG from "../assets/438-4388580_un-sustainable-development-goals-circle-hd-png-download-removebg-preview.png";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dropdown, setDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const syncUser = () => {
      const stored = localStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));
      else setUser(null);
    };

    syncUser();
    window.addEventListener("userUpdated", syncUser);
    return () => window.removeEventListener("userUpdated", syncUser);
  }, []);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setDropdown(false);
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setDropdown(false);
    setMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="navbar" ref={navRef}>
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
          <img src={SDGIMG} className="navbar-logo" alt="SDG Logo" />
          <span className="navbar-title">Sustainable Development City of Manila</span>
        </Link>

        <button
          className={`navbar-hamburger ${mobileMenuOpen ? "open" : ""}`}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((o) => !o)}
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
                {/* Desktop avatar dropdown */}
                <div className="navbar-user">
                  <button className="navbar-avatar-btn" onClick={() => setDropdown((d) => !d)}>
                    <div className="navbar-avatar">{user.fullName?.charAt(0).toUpperCase()}</div>
                    <span className="navbar-username">{user.fullName?.split(" ")[0]}</span>
                    <span className="navbar-chevron">{dropdown ? "▴" : "▾"}</span>
                  </button>

                  {dropdown && (
                    <div className="navbar-dropdown">
                      <div className="dropdown-header">
                        <div className="dropdown-avatar">{user.fullName?.charAt(0).toUpperCase()}</div>
                        <div className="dropdown-info">
                          <p className="dropdown-name">{user.fullName}</p>
                          <p className="dropdown-email">{user.email}</p>
                        </div>
                      </div>
                      <div className="dropdown-divider" />
                      <Link to="/profile" className="dropdown-item" onClick={() => setDropdown(false)}>
                        View profile
                      </Link>
                      <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                        Sign out
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile-only simplified account block */}
                <div className="navbar-mobile-user">
                  <div className="mobile-user-info">
                    <div className="navbar-avatar">{user.fullName?.charAt(0).toUpperCase()}</div>
                    <div>
                      <p className="mobile-user-name">{user.fullName}</p>
                      <p className="mobile-user-email">{user.email}</p>
                    </div>
                  </div>
                  <Link to="/profile" className="mobile-menu-link" onClick={closeMobileMenu}>
                    View profile
                  </Link>
                  <button
                    className="mobile-menu-logout"
                    onClick={() => {
                      handleLogout();
                    }}
                  >
                    Sign out
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