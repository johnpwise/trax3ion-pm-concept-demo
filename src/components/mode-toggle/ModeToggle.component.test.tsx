import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import ModeToggle from "./ModeToggle";
import { MODE_TOGGLE_TEST_IDS } from "./ModeToggle.testIds";

describe("ModeToggle", () => {
  it("should switch from light mode to dark mode", () => {
    // Arrange
    render(<ModeToggle />);
    const button = screen.getByTestId(MODE_TOGGLE_TEST_IDS.button);

    // Act
    fireEvent.click(button);

    // Assert
    expect(screen.getByTestId(MODE_TOGGLE_TEST_IDS.label)).toHaveTextContent("Mode is dark");
    expect(button).toHaveClass("bg-primary");
  });
});
