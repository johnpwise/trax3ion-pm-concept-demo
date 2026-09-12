import { Outlet } from "react-router-dom";

import { APP_SHELL_TEST_IDS } from "./app/appShell.testIds";
import AppShell from "./app/AppShell";

export default function App() {
  return (
    <main data-id={APP_SHELL_TEST_IDS.shell} className="min-h-screen bg-background text-foreground">
      <AppShell>
        <Outlet />
      </AppShell>
    </main>
  );
}
