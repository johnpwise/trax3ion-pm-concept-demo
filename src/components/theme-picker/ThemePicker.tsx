import type { ChangeEvent } from "react";

import { useAppStore } from "../../store/appStore";
import { THEME_PICKER_TEST_IDS } from "./ThemePicker.testIds";

const THEME_OPTIONS = [
  { label: "Default", value: "theme" },
  { label: "Harvest", value: "theme-harvest" },
  { label: "Retro", value: "theme-retro" },
  { label: "Ocean", value: "theme-ocean" },
  { label: "Logo Lime", value: "theme-lime" },
] as const;

export default function ThemePicker() {
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);

  const handleThemeChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    setTheme(event.target.value);
  };

  return (
    <section className="space-y-3 rounded-lg border border-border bg-surface p-4">
      <label data-id={THEME_PICKER_TEST_IDS.label} htmlFor="theme-picker" className="block text-sm font-medium text-muted-foreground">
        Theme
      </label>
      <select
        id="theme-picker"
        data-id={THEME_PICKER_TEST_IDS.select}
        value={theme}
        className="block w-full rounded-md border border-border bg-surface px-3 py-2 text-surface-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onChange={handleThemeChange}
      >
        {THEME_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </section>
  );
}
