import {
  Outlet,
  NavLink,
  Link,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  Target,
  ChartNoAxesCombined,
  Database,
  CalendarDays,
  FolderKanban,
  BookOpen,
  Users,
  Sparkles,
  LogOut,
  FolderPlus,
  CalendarPlus,
  FileCheck2,
} from "lucide-react";

import styles from "./AdminLayout.module.css";
import logo from "../../assets/LOGO.png";

const NAV_SECTIONS = [
  {
    title: "Overview",
    items: [
      { to: "/ai-classifier", label: "AI Classifier", icon: Sparkles },
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/sdg-tracker", label: "SDG Tracker", icon: Target },
      { to: "/analytics", label: "Analytics", icon: ChartNoAxesCombined },
    ],
  },
  {
    title: "Management",
    items: [
      { to: "/data-management", label: "Data Management", icon: Database },
      { to: "/events-projects", label: "Events & Projects", icon: CalendarDays },
      { to: "/project-showcase", label: "Project Showcase", icon: FolderKanban },
    ],
  },
  {
    title: "Resources",
    items: [
      { to: "/knowledge-hub", label: "Knowledge Hub", icon: BookOpen },
    ],
  },
  {
    title: "Administration",
    items: [
      { to: "/user-management", label: "User Management", icon: Users },
      { to: "/completion-reports", label: "Completion Reports", icon: FileCheck2 },
    ],
  },
];

function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  const user = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const adminName = user.fullName || "Admin";
  const adminInitial = adminName.charAt(0).toUpperCase();

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.brand}>
            <NavLink
              to="/dashboard"
              end
              aria-label="Go to Admin Dashboard"
            >
              <img
                src={logo}
                alt="SDG Smart Hub Admin"
                className={styles.brandLogo}
              />
            </NavLink>
          </div>

          <nav className={styles.nav}>
            {NAV_SECTIONS.map((section) => (
              <div key={section.title} className={styles.navSection}>
                <p className={styles.navSectionTitle}>
                  {section.title}
                </p>

                <div className={styles.navSectionItems}>
                  {section.items.map((item) => {
                    const Icon = item.icon;

                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          `${styles.navItem} ${
                            isActive ? styles.active : ""
                          }`
                        }
                      >
                        <Icon
                          className={styles.navIcon}
                          size={16}
                          strokeWidth={1.8}
                        />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          <div className={styles.sidebarAdmin}>
            <div className={styles.sidebarAvatar}>
              {adminInitial}
            </div>

            <div className={styles.sidebarAdminInfo}>
              <span className={styles.sidebarAdminName}>
                {adminName}
              </span>
              <span className={styles.sidebarAdminRole}>
                Administrator
              </span>
            </div>
          </div>

          <button
            type="button"
            className={styles.logoutBtn}
            onClick={handleLogout}
          >
            <LogOut
              className={styles.logoutIcon}
              size={15}
              strokeWidth={1.8}
            />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div className={styles.mainWrapper}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.quickActions}>
              <Link
                to="/data-management"
                className={`${styles.quickAction} ${styles.addProjectAction}`}
              >
                <FolderPlus size={16} strokeWidth={1.9} />
                <span>Add Project</span>
              </Link>

              <Link
                to="/events-projects"
                className={`${styles.quickAction} ${styles.addEventAction}`}
              >
                <CalendarPlus size={16} strokeWidth={1.9} />
                <span>Add Event</span>
              </Link>
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.adminBadge}>
              <div className={styles.adminAvatar}>
                {adminInitial}
              </div>

              <div className={styles.adminInfo}>
                <span className={styles.adminName}>
                  {adminName}
                </span>
                <span className={styles.adminRole}>
                  Administrator
                </span>
              </div>
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