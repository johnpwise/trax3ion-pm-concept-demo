import { describe, expect, it } from "vitest";

import { getEventsForDate, type ToolCalendarEvent } from "./availability";

function buildEvent(overrides: Partial<ToolCalendarEvent> = {}): ToolCalendarEvent {
  return {
    resourceId: "res-alfred",
    start: "2026-09-24T09:00:00",
    ...overrides,
  };
}

describe("getEventsForDate", () => {
  it("should match the annual leave event to its actual Wednesday date, not the following Thursday", () => {
    // Arrange
    const annualLeave = buildEvent({ resourceId: "res-alfred", start: "2026-09-23T09:00:00", end: "2026-09-23T17:00:00", title: "Annual Leave" });
    const claimsBooking = buildEvent({ resourceId: "res-alfred", start: "2026-09-24T09:00:00", end: "2026-09-24T12:00:00", title: "Claims Automation" });
    const events = [annualLeave, claimsBooking];

    // Act
    const wednesdayResults = getEventsForDate(events, "2026-09-23");
    const thursdayResults = getEventsForDate(events, "2026-09-24");

    // Assert
    expect(wednesdayResults).toEqual([annualLeave]);
    expect(thursdayResults).toEqual([claimsBooking]);
  });

  it("should filter to a single resource when resourceId is given", () => {
    // Arrange
    const alfredEvent = buildEvent({ resourceId: "res-alfred" });
    const naomiEvent = buildEvent({ resourceId: "res-naomi" });
    const events = [alfredEvent, naomiEvent];

    // Act
    const results = getEventsForDate(events, "2026-09-24", "res-alfred");

    // Assert
    expect(results).toEqual([alfredEvent]);
  });

  it("should return events for all resources when resourceId is omitted", () => {
    // Arrange
    const alfredEvent = buildEvent({ resourceId: "res-alfred" });
    const naomiEvent = buildEvent({ resourceId: "res-naomi" });
    const events = [alfredEvent, naomiEvent];

    // Act
    const results = getEventsForDate(events, "2026-09-24");

    // Assert
    expect(results).toEqual([alfredEvent, naomiEvent]);
  });

  it("should return an empty array when no events fall on the requested date", () => {
    // Arrange
    const events = [buildEvent({ start: "2026-09-24T09:00:00" })];

    // Act
    const results = getEventsForDate(events, "2026-09-25");

    // Assert
    expect(results).toEqual([]);
  });
});
