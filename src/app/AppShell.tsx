import { Menu } from "lucide-react";
import { type ReactNode, useEffect } from "react";

import trax3ionLogo from "../assets/images/trax3ion-pm-logo.png";
import ToastViewport from "../components/common/ToastViewport";
import { useMediaQuery } from "../lib/useMediaQuery";
import { useAppStore } from "../store/appStore";
import SidebarNav from "./SidebarNav";

export default function AppShell({ children }: { children: ReactNode }) {
  const isDesktopViewport = useMediaQuery("(min-width: 768px)");
  const isMobileNavOpen = useAppStore((state) => state.isMobileNavOpen);
  const openMobileNav = useAppStore((state) => state.openMobileNav);
  const closeMobileNav = useAppStore((state) => state.closeMobileNav);

  // Keep drawer state consistent if the viewport crosses the breakpoint while it's open
  // (e.g. rotating a device or resizing devtools), so it doesn't reopen unexpectedly later.
  useEffect(() => {
    if (isDesktopViewport && isMobileNavOpen) {
      closeMobileNav();
    }
  }, [isDesktopViewport, isMobileNavOpen, closeMobileNav]);

  useEffect(() => {
    if (isDesktopViewport || !isMobileNavOpen) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") closeMobileNav();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDesktopViewport, isMobileNavOpen, closeMobileNav]);

  return (
    <div className="flex min-h-screen bg-background-1">
      {isDesktopViewport ? <SidebarNav /> : null}

      {!isDesktopViewport && isMobileNavOpen ? (
        <div className="fixed inset-0 z-40 flex">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={closeMobileNav}
            className="absolute inset-0 bg-black/40"
          />
          <SidebarNav variant="mobile" onNavigate={closeMobileNav} />
        </div>
      ) : null}

      <div className="min-w-0 flex-1 overflow-y-auto">
        {!isDesktopViewport ? (
          <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-2">
            <button
              type="button"
              onClick={openMobileNav}
              aria-label="Open navigation"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/40"
            >
              <Menu className="h-5 w-5" />
            </button>
            <img src={trax3ionLogo} alt="Trax3ion PM" className="h-8 w-auto" />
          </div>
        ) : null}
        <div className="mx-auto max-w-6xl px-6 py-8 sm:px-8">{children}</div>
      </div>
      <ToastViewport />
    </div>
  );
}
