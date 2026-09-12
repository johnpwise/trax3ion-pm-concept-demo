import { useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Moon,
  RotateCcw,
  Sun,
  Users,
} from "lucide-react";
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

type SidebarNavProps = {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
};

export default function SidebarNav({ variant = "desktop", onNavigate }: SidebarNavProps) {
  const isMobile = variant === "mobile";
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const toggleDarkMode = useAppStore((state) => state.toggleDarkMode);
  const storedIsCollapsed = useAppStore((state) => state.isSidebarCollapsed);
  const toggleSidebarCollapsed = useAppStore((state) => state.toggleSidebarCollapsed);
  const isCollapsed = isMobile ? false : storedIsCollapsed;
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
    <aside
      className={`flex shrink-0 flex-col bg-primary-950 text-white/80 transition-[width] duration-200 ${
        isMobile ? "relative h-full w-72 max-w-[85vw]" : "relative"
      } ${!isMobile && isCollapsed ? "w-[4.5rem]" : ""} ${!isMobile && !isCollapsed ? "w-60" : ""}`}
    >
      {isMobile ? null : (
        <button
          type="button"
          onClick={toggleSidebarCollapsed}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="before:absolute before:-inset-2.5 before:content-[''] absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-primary-950 text-white/70 shadow-sm transition-colors hover:bg-white/10 hover:text-white"
        >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      )}

      <Link
        to="/dashboard"
        title={isCollapsed ? "Trax3ion PM" : undefined}
        onClick={onNavigate}
        className={`flex items-center overflow-hidden px-5 py-5 ${isCollapsed ? "justify-center px-0" : ""}`}
      >
        {isCollapsed ? (
          <span className="block h-10 w-10 overflow-hidden">
            <img src={trax3ionLogo} alt="Trax3ion PM" className="h-10 w-auto max-w-none object-cover object-left" />
          </span>
        ) : (
          <img src={trax3ionLogo} alt="Trax3ion PM" className="h-14 w-auto" />
        )}
      </Link>

      <nav className="flex-1 space-y-1 px-3 py-2" aria-label="Primary">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            title={isCollapsed ? label : undefined}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                isCollapsed ? "justify-center" : ""
              } ${isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}`
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {isCollapsed ? <span className="sr-only">{label}</span> : label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-2 border-t border-white/10 px-3 py-3">
        <button
          type="button"
          onClick={toggleDarkMode}
          title={isCollapsed ? (isDarkMode ? "Light mode" : "Dark mode") : undefined}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          {isDarkMode ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
          {isCollapsed ? null : isDarkMode ? "Light mode" : "Dark mode"}
        </button>
        {canEdit ? (
          <button
            type="button"
            onClick={() => setIsResetDialogOpen(true)}
            title={isCollapsed ? "Reset Demo Data" : undefined}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <RotateCcw className="h-4 w-4 shrink-0" />
            {isCollapsed ? null : "Reset Demo Data"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={handleLogout}
          title={isCollapsed ? "Log out" : undefined}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {isCollapsed ? null : "Log out"}
        </button>
        {!isCollapsed && currentUser ? (
          <p className="px-3 pt-1 text-[11px] leading-snug text-white/40">
            Signed in as <span className="text-white/60">{currentUser.name}</span> ({currentUser.role === "project-manager" ? "Project Manager" : "User"})
          </p>
        ) : null}
        {!isCollapsed ? (
          <p className="px-3 text-[11px] leading-snug text-white/40">Concept demo build — no backend or live data connected.</p>
        ) : null}
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
