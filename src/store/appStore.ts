import { create } from "zustand";

type AppState = {
  isDarkMode: boolean;
  theme: string;
  isSidebarCollapsed: boolean;
  toggleDarkMode: () => void;
  setTheme: (theme: string) => void;
  toggleSidebarCollapsed: () => void;
};

const applyPreferences = (isDarkMode: boolean, theme: string): void => {
  document.documentElement.classList.toggle("dark", isDarkMode);
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("isDarkMode", String(isDarkMode));
  localStorage.setItem("theme", theme);
};

const storedDarkMode = localStorage.getItem("isDarkMode") === "true";
const storedTheme = localStorage.getItem("theme") ?? "theme";
const storedSidebarCollapsed = localStorage.getItem("isSidebarCollapsed") === "true";

applyPreferences(storedDarkMode, storedTheme);

export const useAppStore = create<AppState>((set, get) => ({
  isDarkMode: storedDarkMode,
  theme: storedTheme,
  isSidebarCollapsed: storedSidebarCollapsed,
  toggleDarkMode: () => {
    const isDarkMode = !get().isDarkMode;
    applyPreferences(isDarkMode, get().theme);
    set({ isDarkMode });
  },
  setTheme: (theme) => {
    applyPreferences(get().isDarkMode, theme);
    set({ theme });
  },
  toggleSidebarCollapsed: () => {
    const isSidebarCollapsed = !get().isSidebarCollapsed;
    localStorage.setItem("isSidebarCollapsed", String(isSidebarCollapsed));
    set({ isSidebarCollapsed });
  },
}));
