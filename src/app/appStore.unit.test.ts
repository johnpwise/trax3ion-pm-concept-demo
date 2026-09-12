import { beforeEach, describe, expect, it } from "vitest";

import { useAppStore } from "../store/appStore";

describe("useAppStore", () => {
  beforeEach(() => {
    // Arrange
    localStorage.clear();
    useAppStore.setState({ isDarkMode: false, theme: "theme" });
    document.documentElement.className = "";
    document.documentElement.dataset.theme = "theme";
  });

  it("should persist mode and theme preferences", () => {
    // Arrange
    const store = useAppStore.getState();

    // Act
    store.toggleDarkMode();
    store.setTheme("theme-ocean");

    // Assert
    expect(useAppStore.getState()).toMatchObject({ isDarkMode: true, theme: "theme-ocean" });
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.dataset.theme).toBe("theme-ocean");
    expect(localStorage.getItem("isDarkMode")).toBe("true");
  });

  it("should open and close the mobile nav without persisting to localStorage", () => {
    // Arrange
    const store = useAppStore.getState();
    expect(useAppStore.getState().isMobileNavOpen).toBe(false);

    // Act
    store.openMobileNav();

    // Assert
    expect(useAppStore.getState().isMobileNavOpen).toBe(true);
    expect(localStorage.getItem("isMobileNavOpen")).toBeNull();

    // Act
    store.closeMobileNav();

    // Assert
    expect(useAppStore.getState().isMobileNavOpen).toBe(false);
  });
});
