import { useAppStore } from "../../store/appStore";
import { MODE_TOGGLE_TEST_IDS } from "./ModeToggle.testIds";

export default function ModeToggle() {
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const toggleDarkMode = useAppStore((state) => state.toggleDarkMode);

  return (
    <section className="space-y-3 rounded-lg border border-border bg-surface p-4">
      <p data-id={MODE_TOGGLE_TEST_IDS.label} className="text-sm text-muted-foreground">
        Mode is {isDarkMode ? "dark" : "light"}
      </p>
      <button
        type="button"
        data-id={MODE_TOGGLE_TEST_IDS.button}
        className="inline-flex items-center rounded-md border border-primary-line bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onClick={toggleDarkMode}
      >
        Toggle Mode
      </button>
    </section>
  );
}
