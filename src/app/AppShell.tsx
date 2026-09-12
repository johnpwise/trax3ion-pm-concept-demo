import type { ReactNode } from "react";

import ToastViewport from "../components/common/ToastViewport";
import SidebarNav from "./SidebarNav";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background-1">
      <SidebarNav />
      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8 sm:px-8">{children}</div>
      </div>
      <ToastViewport />
    </div>
  );
}
