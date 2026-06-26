import "./Navbar.css";
import { Link } from "react-router-dom";
import SDGIMG from "../assets/438-4388580_un-sustainable-development-goals-circle-hd-png-download-removebg-preview.png";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">

       
        <div className="navbar-brand">
          <img src={SDGIMG} className="navbar-logo" alt="SDG Logo" />
          <span className="navbar-title">Sustainable Development City of Manila</span>
        </div>

      
        <div className="navbar-links">
          <Link to="/sdgs" className="nav-link">17 SDGs</Link>
          <Link to="/analytics" className="nav-link">Analytics</Link>
          <Link to="/highlights" className="nav-link">SDG Highlights</Link>
          <Link to="/events" className="nav-link">Events</Link>
          <Link to="/knowledge" className="nav-link">Knowledge Hub</Link>
        </div>

      
        <div className="navbar-auth">
          <Link to="/login" className="nav-signin">Sign In</Link>
          <Link to="/signup" className="nav-signup">Sign Up</Link>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;