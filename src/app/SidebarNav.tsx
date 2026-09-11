import { useState } from "react";
import { CalendarDays, FolderKanban, LayoutDashboard, LogOut, Moon, RotateCcw, Sun, Users } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import trax3ionLogo from "../assets/images/trax3ion-pm-logo.png";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { useToastStore } from "../components/common/toastStore";
import { useAppStore } from "../store/appStore";
import { useAuthStore, useCanEdit } from "../store/authStore";
import { useTraxionDemoStore } from "../store/useTraxionDemoStore";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/scheduler", label: "Scheduler", icon: CalendarDays },
] as const;

export default function SidebarNav() {
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const toggleDarkMode = useAppStore((state) => state.toggleDarkMode);
  const resetDemoData = useTraxionDemoStore((state) => state.resetDemoData);
  const showToast = useToastStore((state) => state.showToast);
  const currentUser = useAuthStore((state) => state.currentUser);
  const logout = useAuthStore((state) => state.logout);
  const canEdit = useCanEdit();
  const navigate = useNavigate();

  const handleConfirmReset = (): void => {
    resetDemoData();
    setIsResetDialogOpen(false);
    navigate("/dashboard");
    showToast("Demo data has been reset to its starting state.");
  };

  const handleLogout = (): void => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="flex w-60 shrink-0 flex-col bg-primary-950 text-white/80">
      <Link to="/dashboard" className="flex items-center px-5 py-5">
        <img src={trax3ionLogo} alt="Trax3ion PM" className="h-14 w-auto" />
      </Link>

      <nav className="flex-1 space-y-1 px-3 py-2" aria-label="Primary">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-2 border-t border-white/10 px-3 py-3">
        <button
          type="button"
          onClick={toggleDarkMode}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {isDarkMode ? "Light mode" : "Dark mode"}
        </button>
        {canEdit ? (
          <button
            type="button"
            onClick={() => setIsResetDialogOpen(true)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Demo Data
          </button>
        ) : null}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
        {currentUser ? (
          <p className="px-3 pt-1 text-[11px] leading-snug text-white/40">
            Signed in as <span className="text-white/60">{currentUser.name}</span> ({currentUser.role === "project-manager" ? "Project Manager" : "User"})
          </p>
        ) : null}
        <p className="px-3 text-[11px] leading-snug text-white/40">Concept demo build — no backend or live data connected.</p>
      </div>

      {isResetDialogOpen ? (
        <ConfirmDialog
          title="Reset Demo Data"
          description="This restores every customer, project, hierarchy and scheduler change back to the original seed data. This cannot be undone."
          confirmLabel="Reset Demo Data"
          tone="destructive"
          onConfirm={handleConfirmReset}
          onCancel={() => setIsResetDialogOpen(false)}
        />
      ) : null}
    </aside>
  );
}
