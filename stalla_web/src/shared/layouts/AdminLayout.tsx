import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import { Icon } from "../components/Icon";
import type { IconName } from "../components/Icon";

const navLinks: { to: string; label: string; icon: IconName }[] = [
  { to: "/admin", label: "Dashboard", icon: "home" },
  { to: "/admin/stalls", label: "Gestion Stands", icon: "store" },
  { to: "/admin/vendors", label: "Vendeurs", icon: "users" },
  { to: "/admin/applications", label: "Candidatures", icon: "alert" },
  { to: "/admin/allocations", label: "Allocations", icon: "merge" },
  { to: "/admin/payments", label: "Paiements", icon: "card" },
  { to: "/admin/debtors", label: "Débiteurs", icon: "alert" },
];

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/stalls": "Gestion Stands",
  "/admin/vendors": "Vendeurs",
  "/admin/applications": "Candidatures Vendeurs",
  "/admin/allocations": "Allocations",
  "/admin/payments": "Paiements",
  "/admin/debtors": "Débiteurs",
  "/admin/support": "Support",
};

export function AdminLayout() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const pageTitle = pageTitles[pathname] ?? "Dashboard";
  const initials = (user?.name ?? "A")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="brand-row">
          <img src="/logo.png" alt="Stalla" />
        </div>

        <nav className="admin-nav">
          {navLinks.map((link) => (
            <Link key={link.to} className={pathname === link.to ? "active" : ""} to={link.to}>
              <Icon name={link.icon} />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-nav admin-nav-bottom">
          <Link className={pathname === "/admin/support" ? "active" : ""} to="/admin/support">
            <Icon name="help" />
            <span>Support</span>
          </Link>
          <button className="side-logout" onClick={logout} type="button">
            <Icon name="logout" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <h2>{pageTitle}</h2>
          <div className="topbar-profile">
            <div className="profile-text">
              <strong>{user?.name ?? "Admin"}</strong>
              <p>Super Admin</p>
            </div>
            <div className="profile-avatar">{initials}</div>
          </div>
        </header>

        <div className="page-wrap">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
