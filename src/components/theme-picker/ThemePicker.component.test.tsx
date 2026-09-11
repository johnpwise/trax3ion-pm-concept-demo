import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import ThemePicker from "./ThemePicker";
import { THEME_PICKER_TEST_IDS } from "./ThemePicker.testIds";

describe("ThemePicker", () => {
  it("should change the selected theme", () => {
    // Arrange
    render(<ThemePicker />);
    const select = screen.getByTestId(THEME_PICKER_TEST_IDS.select);

    // Act
    fireEvent.change(select, { target: { value: "theme-ocean" } });

    // Assert
    expect(select).toHaveValue("theme-ocean");
    expect(select).toHaveClass("bg-surface");
  });
});
