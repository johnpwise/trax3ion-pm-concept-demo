import { create } from "zustand";

type AppState = {
  isDarkMode: boolean;
  theme: string;
  isSidebarCollapsed: boolean;
  isMobileNavOpen: boolean;
  toggleDarkMode: () => void;
  setTheme: (theme: string) => void;
  toggleSidebarCollapsed: () => void;
  openMobileNav: () => void;
  closeMobileNav: () => void;
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
  isMobileNavOpen: false,
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
  openMobileNav: () => set({ isMobileNavOpen: true }),
  closeMobileNav: () => set({ isMobileNavOpen: false }),
}));
