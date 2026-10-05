import {
  Outlet,
  NavLink,
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
} from "lucide-react";
import styles from "./AdminLayout.module.css";
import logo from "../../assets/sdg-smarthub-admin.png";

const NAV_SECTIONS = [
  {
    title: "Overview",
    items: [
      {
        to: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
      },
      {
        to: "/sdg-tracker",
        label: "SDG Tracker",
        icon: Target,
      },
      {
        to: "/analytics",
        label: "Analytics",
        icon: ChartNoAxesCombined,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        to: "/data-management",
        label: "Data Management",
        icon: Database,
      },
      {
        to: "/events-projects",
        label: "Events & Projects",
        icon: CalendarDays,
      },
      {
        to: "/project-showcase",
        label: "Project Showcase",
        icon: FolderKanban,
      },
    ],
  },
  {
    title: "Resources",
    items: [
      {
        to: "/knowledge-hub",
        label: "Knowledge Hub",
        icon: BookOpen,
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        to: "/user-management",
        label: "User Management",
        icon: Users,
      },
      {
        to: "/ai-classifier",
        label: "AI Classifier",
        icon: Sparkles,
      },
    ],
  },
];

function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  const user = JSON.parse(
    localStorage.getItem("adminUser") || "{}"
  );

  const adminName =
    user.fullName || "Admin";

  const adminInitial =
    adminName.charAt(0).toUpperCase();

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.brand}>
            <img
              src={logo}
              alt="SDG Smart Hub Admin"
              className={styles.brandLogo}
            />
          </div>

          <nav className={styles.nav}>
            {NAV_SECTIONS.map(
              (section) => (
                <div
                  key={section.title}
                  className={styles.navSection}
                >
                  <p
                    className={
                      styles.navSectionTitle
                    }
                  >
                    {section.title}
                  </p>

                  <div
                    className={
                      styles.navSectionItems
                    }
                  >
                    {section.items.map(
                      (item) => {
                        const Icon =
                          item.icon;

                        return (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            className={({
                              isActive,
                            }) =>
                              `${styles.navItem} ${
                                isActive
                                  ? styles.active
                                  : ""
                              }`
                            }
                          >
                            <Icon
                              className={
                                styles.navIcon
                              }
                              size={16}
                              strokeWidth={1.8}
                            />

                            <span>
                              {item.label}
                            </span>
                          </NavLink>
                        );
                      }
                    )}
                  </div>
                </div>
              )
            )}
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          <div className={styles.sidebarAdmin}>
            <div
              className={
                styles.sidebarAvatar
              }
            >
              {adminInitial}
            </div>

            <div
              className={
                styles.sidebarAdminInfo
              }
            >
              <span
                className={
                  styles.sidebarAdminName
                }
              >
                {adminName}
              </span>

              <span
                className={
                  styles.sidebarAdminRole
                }
              >
                Administrator
              </span>
            </div>
          </div>

          <button
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
            <p
              className={
                styles.headerEyebrow
              }
            >
              SDG SMART HUB
            </p>

            <p
              className={
                styles.headerGreeting
              }
            >
              Welcome back, Admin. Here's
              what's happening in your
              community.
            </p>
          </div>

          <div className={styles.headerRight}>
            <div
              className={styles.adminBadge}
            >
              <div
                className={
                  styles.adminAvatar
                }
              >
                {adminInitial}
              </div>

              <div
                className={
                  styles.adminInfo
                }
              >
                <span
                  className={
                    styles.adminName
                  }
                >
                  {adminName}
                </span>

                <span
                  className={
                    styles.adminRole
                  }
                >
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