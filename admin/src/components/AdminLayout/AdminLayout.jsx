import { Outlet, NavLink, useNavigate } from "react-router-dom";
import styles from "./AdminLayout.module.css";

const NAV_ITEMS = [
  { to: "/dashboard",        label: "Dashboard",        icon: "⊞" },
  { to: "/sdg-tracker",      label: "SDG Tracker",      icon: "◎" },
  { to: "/analytics",        label: "Analytics",        icon: "▦" },
  { to: "/data-management",  label: "Data Management",  icon: "⊟" },
  { to: "/events-projects",  label: "Events & Projects", icon: "⊡" },
  { to: "/user-management",  label: "User Management",  icon: "⊙" },
  { to: "/project-showcase", label: "Project Showcase", icon: "⊠" },
  { to: "/knowledge-hub",    label: "Knowledge Hub",    icon: "⊞" },
  { to: "/ai-classifier",    label: "AI Classifier",     icon: "✦" },
];

function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  const user = JSON.parse(localStorage.getItem("adminUser") || "{}");

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>SDG</div>
            <div className={styles.brandText}>
              <p className={styles.brandName}>Smart Hub</p>
            </div>
          </div>

          <nav className={styles.nav}>
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.active : ""}`
                }
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          ⊗ Sign out
        </button>
      </aside>

      <div className={styles.mainWrapper}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <p className={styles.headerGreeting}>
              Welcome back, Admin. Here's what's happening in your community.
            </p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.adminBadge}>
              <div className={styles.adminAvatar}>
                {user.fullName ? user.fullName.charAt(0) : "A"}
              </div>
              <span className={styles.adminName}>{user.fullName || "Admin"}</span>
            </div>
          </div>
        </header>

        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;