import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import type { CalendarEvent, Resource } from "../../../types/domain";
import ResourceCalendarBoard from "./ResourceCalendarBoard";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function mockMatchMedia(matches: boolean): void {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

const resources: Resource[] = [{ id: "res-1", name: "Maya Chen", role: "Consultant", status: "active" }];

const weekStart = new Date(2026, 2, 9); // Monday 9 Mar 2026
const visibleDay = new Date(2026, 2, 11); // Wednesday 11 Mar 2026

const calendarEvents: CalendarEvent[] = [
  { id: "evt-1", resourceId: "res-1", title: "Kickoff", start: "2026-03-11T09:00:00", end: "2026-03-11T10:00:00", source: "trax3ion" },
];

describe("ResourceCalendarBoard", () => {
  it("should render all five weekdays side by side on desktop viewports", () => {
    // Arrange
    mockMatchMedia(true);

    // Act
    render(<ResourceCalendarBoard resources={resources} calendarEvents={calendarEvents} weekStart={weekStart} visibleDay={visibleDay} onEventClick={vi.fn()} />);

    // Assert
    expect(screen.getAllByText(/^(Mon|Tue|Wed|Thu|Fri) \d{1,2}$/)).toHaveLength(5);
  });

  it("should render only the visible day on mobile viewports", () => {
    // Arrange
    mockMatchMedia(false);

    // Act
    render(<ResourceCalendarBoard resources={resources} calendarEvents={calendarEvents} weekStart={weekStart} visibleDay={visibleDay} onEventClick={vi.fn()} />);

    // Assert
    const dayHeaders = screen.getAllByText(/^(Mon|Tue|Wed|Thu|Fri) \d{1,2}$/);
    expect(dayHeaders).toHaveLength(1);
    expect(dayHeaders[0]).toHaveTextContent("Wed 11");
  });

  it("should stack multiple resource panes vertically instead of side-scrolling on mobile", () => {
    // Arrange
    mockMatchMedia(false);
    const twoResources: Resource[] = [...resources, { id: "res-2", name: "Sam Patel", role: "Consultant", status: "active" }];

    // Act
    const { container } = render(
      <ResourceCalendarBoard resources={twoResources} calendarEvents={calendarEvents} weekStart={weekStart} visibleDay={visibleDay} onEventClick={vi.fn()} />,
    );

    // Assert
    expect(container.querySelector(".overflow-x-auto")).not.toBeInTheDocument();
    expect(container.querySelector(".flex-col")).toBeInTheDocument();
    expect(screen.getAllByText("Maya Chen")).toHaveLength(1);
    expect(screen.getAllByText("Sam Patel")).toHaveLength(1);
  });

  it("should keep the horizontally-scrolling row layout for multiple resources on desktop", () => {
    // Arrange
    mockMatchMedia(true);
    const twoResources: Resource[] = [...resources, { id: "res-2", name: "Sam Patel", role: "Consultant", status: "active" }];

    // Act
    const { container } = render(
      <ResourceCalendarBoard resources={twoResources} calendarEvents={calendarEvents} weekStart={weekStart} visibleDay={visibleDay} onEventClick={vi.fn()} />,
    );

    // Assert
    expect(container.querySelector(".overflow-x-auto")).toBeInTheDocument();
    expect(container.querySelector(".flex-col")).not.toBeInTheDocument();
  });
});
