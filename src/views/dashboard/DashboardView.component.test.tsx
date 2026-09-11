import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import DashboardView from "./DashboardView";

describe("DashboardView", () => {
  it("should render only the dashboard heading", () => {
    // Arrange
    const { container } = render(<DashboardView />);

    // Act
    const heading = screen.getByRole("heading", { level: 1 });

    // Assert
    expect(heading).toHaveTextContent("Trax3ion PM Dashboard");
    expect(container.textContent).toBe("Trax3ion PM Dashboard");
  });
});
