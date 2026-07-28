import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import SDGIMG from "../assets/438-4388580_un-sustainable-development-goals-circle-hd-png-download-removebg-preview.png";

function Navbar() {
  const navigate    = useNavigate();
  const [user, setUser]         = useState(null);
  const [dropdown, setDropdown] = useState(false);
  const dropdownRef             = useRef(null);

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
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setDropdown(false);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <img src={SDGIMG} className="navbar-logo" alt="SDG Logo" />
          <span className="navbar-title">Sustainable Development City of Manila</span>
        </Link>

        <div className="navbar-links">
          <Link to="/highlights" className="nav-link">SDG Highlights</Link>
          <Link to="/events"     className="nav-link">Events</Link>
          <Link to="/knowledge"  className="nav-link">Knowledge Hub</Link>
          <Link to="/about"      className="nav-link">About</Link>
        </div>

        <div className="navbar-auth">
          {user ? (
            <div className="navbar-user" ref={dropdownRef}>
              <button
                className="navbar-avatar-btn"
                onClick={() => setDropdown((d) => !d)}
              >
                <div className="navbar-avatar">
                  {user.fullName?.charAt(0).toUpperCase()}
                </div>
                <span className="navbar-username">
                  {user.fullName?.split(" ")[0]}
                </span>
                <span className="navbar-chevron">{dropdown ? "▴" : "▾"}</span>
              </button>

              {dropdown && (
                <div className="navbar-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">
                      {user.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="dropdown-info">
                      <p className="dropdown-name">{user.fullName}</p>
                      <p className="dropdown-email">{user.email}</p>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <Link
                    to="/profile"
                    className="dropdown-item"
                    onClick={() => setDropdown(false)}
                  >
                    View profile
                  </Link>
                  <button
                    className="dropdown-item dropdown-logout"
                    onClick={handleLogout}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login"  className="nav-signin">Sign In</Link>
              <Link to="/signup" className="nav-signup">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;