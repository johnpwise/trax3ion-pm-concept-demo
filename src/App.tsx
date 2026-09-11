import { Outlet } from "react-router-dom";

import { APP_SHELL_TEST_IDS } from "./app/appShell.testIds";

export default function App() {
  return (
    <main data-id={APP_SHELL_TEST_IDS.shell} className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </main>
  );
}
