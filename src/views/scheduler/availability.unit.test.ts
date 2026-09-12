import { describe, expect, it } from "vitest";

import { computeBookingWindow, findAvailableSlots, findConflicts } from "./availability";
import type { CalendarEvent } from "../../types/domain";

const DAY = "2026-03-09"; // a Monday

function localIso(hour: number, minute = 0): string {
  return `${DAY}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
}

function toIso(hour: number, minute = 0): string {
  return new Date(localIso(hour, minute)).toISOString();
}

function buildEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: "evt-1",
    resourceId: "res-1",
    title: "Existing",
    start: toIso(9, 0),
    end: toIso(10, 0),
    source: "trax3ion",
    ...overrides,
  };
}

describe("computeBookingWindow", () => {
  it("should combine date, time, and duration into a local start/end window", () => {
    // Arrange & Act
    const window = computeBookingWindow(DAY, "09:00", 2);

    // Assert
    expect(window.start).toBe(toIso(9, 0));
    expect(window.end).toBe(toIso(11, 0));
  });
});

describe("findConflicts", () => {
  it("should return events for the same resource that overlap the candidate window", () => {
    // Arrange
    const events = [buildEvent({ id: "evt-a", start: toIso(9, 0), end: toIso(10, 0) })];

    // Act
    const conflicts = findConflicts({ start: toIso(9, 30), end: toIso(10, 30) }, "res-1", events);

    // Assert
    expect(conflicts.map((event) => event.id)).toEqual(["evt-a"]);
  });

  it("should ignore events for other resources", () => {
    // Arrange
    const events = [buildEvent({ id: "evt-a", resourceId: "res-2", start: toIso(9, 0), end: toIso(10, 0) })];

    // Act
    const conflicts = findConflicts({ start: toIso(9, 30), end: toIso(10, 30) }, "res-1", events);

    // Assert
    expect(conflicts).toEqual([]);
  });

  it("should ignore events that do not overlap the candidate window", () => {
    // Arrange
    const events = [buildEvent({ id: "evt-a", start: toIso(11, 0), end: toIso(12, 0) })];

    // Act
    const conflicts = findConflicts({ start: toIso(9, 0), end: toIso(10, 0) }, "res-1", events);

    // Assert
    expect(conflicts).toEqual([]);
  });

  it("should exclude the event matching excludeEventId", () => {
    // Arrange
    const events = [buildEvent({ id: "evt-a", start: toIso(9, 0), end: toIso(10, 0) })];

    // Act
    const conflicts = findConflicts({ start: toIso(9, 0), end: toIso(10, 0) }, "res-1", events, "evt-a");

    // Assert
    expect(conflicts).toEqual([]);
  });
});

describe("findAvailableSlots", () => {
  it("should start from the beginning of the working range when there are no events", () => {
    // Arrange
    const day = new Date(2026, 2, 9);

    // Act
    const slots = findAvailableSlots(day, 1, "res-1", []);

    // Assert
    expect(slots[0].start).toBe(toIso(7, 0));
  });

  it("should return the first free slot after an existing busy block", () => {
    // Arrange
    const events = [buildEvent({ start: toIso(7, 0), end: toIso(11, 0) })];
    const day = new Date(2026, 2, 9);

    // Act
    const slots = findAvailableSlots(day, 1, "res-1", events);

    // Assert
    expect(slots[0].start).toBe(toIso(11, 0));
  });

  it("should return no slots when the resource is busy for the whole working range", () => {
    // Arrange
    const events = [buildEvent({ start: toIso(7, 0), end: toIso(19, 0) })];
    const day = new Date(2026, 2, 9);

    // Act
    const slots = findAvailableSlots(day, 1, "res-1", events);

    // Assert
    expect(slots).toEqual([]);
  });

  it("should cap results at maxResults", () => {
    // Arrange
    const day = new Date(2026, 2, 9);

    // Act
    const slots = findAvailableSlots(day, 1, "res-1", [], undefined, 15, 2);

    // Assert
    expect(slots).toHaveLength(2);
  });
});
