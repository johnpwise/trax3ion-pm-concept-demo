import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";

import type { CalendarEvent } from "../../../types/domain";
import CalendarEventBlock from "./CalendarEventBlock";

afterEach(cleanup);

const baseEvent: CalendarEvent = {
  id: "evt-1",
  resourceId: "res-me",
  title: "Client Check-in",
  start: "2026-03-09T09:00:00",
  end: "2026-03-09T10:00:00",
  source: "trax3ion",
};

describe("CalendarEventBlock", () => {
  it("should render a Trax3ion booking with solid styling and a briefcase icon", () => {
    // Arrange & Act
    const { getByRole, getByText } = render(<CalendarEventBlock event={baseEvent} onClick={vi.fn()} style={{}} />);
    const button = getByRole("button");

    // Assert
    expect(button).toHaveClass("border-primary-line");
    expect(button.querySelector("svg.lucide-briefcase")).not.toBeNull();
    expect(getByText("Client Check-in")).toBeInTheDocument();
  });

  it("should render an Outlook commitment with dashed styling and a calendar-clock icon", () => {
    // Arrange
    const outlookEvent: CalendarEvent = { ...baseEvent, source: "outlook", title: "Teams Meeting" };

    // Act
    const { getByRole } = render(<CalendarEventBlock event={outlookEvent} onClick={vi.fn()} style={{}} />);
    const button = getByRole("button");

    // Assert
    expect(button).toHaveClass("border-dashed");
    expect(button.querySelector("svg.lucide-calendar-clock")).not.toBeNull();
  });

  it("should call onClick when clicked", () => {
    // Arrange
    const onClick = vi.fn();
    const { getByRole } = render(<CalendarEventBlock event={baseEvent} onClick={onClick} style={{}} />);

    // Act
    fireEvent.click(getByRole("button"));

    // Assert
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should apply the geometry style passed in for absolute positioning", () => {
    // Arrange & Act
    const { getByRole } = render(
      <CalendarEventBlock event={baseEvent} onClick={vi.fn()} style={{ top: 48, height: 96, left: "0%", width: "50%" }} />,
    );
    const button = getByRole("button");

    // Assert
    expect(button).toHaveClass("absolute");
    expect(button.style.top).toBe("48px");
    expect(button.style.height).toBe("96px");
  });
});
