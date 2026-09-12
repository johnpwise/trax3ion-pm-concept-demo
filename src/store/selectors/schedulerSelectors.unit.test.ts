import { describe, expect, it } from "vitest";

import { getActionConflicts } from "./schedulerSelectors";
import type { Action, CalendarEvent } from "../../types/domain";

const DAY = "2026-03-09"; // a Monday

function localIso(hour: number, minute = 0): string {
  return `${DAY}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
}

function toIso(hour: number, minute = 0): string {
  return new Date(localIso(hour, minute)).toISOString();
}

function buildAction(overrides: Partial<Action> = {}): Action {
  return {
    id: "action-1",
    taskId: "task-1",
    name: "Test Action",
    estimatedHours: 2,
    status: "active",
    sortOrder: 0,
    resourceId: "res-1",
    ...overrides,
  };
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

describe("getActionConflicts", () => {
  it("should return an empty array when the action has no resource assigned", () => {
    // Arrange
    const action = buildAction({ resourceId: undefined });
    const events = [buildEvent({ actionId: "action-1", source: "trax3ion" })];

    // Act
    const conflicts = getActionConflicts(action, events);

    // Assert
    expect(conflicts).toEqual([]);
  });

  it("should return an empty array when the action has no booking", () => {
    // Arrange
    const action = buildAction();
    const events = [buildEvent({ id: "evt-other", actionId: "other-action", source: "trax3ion" })];

    // Act
    const conflicts = getActionConflicts(action, events);

    // Assert
    expect(conflicts).toEqual([]);
  });

  it("should return overlapping events for the action's resource", () => {
    // Arrange
    const action = buildAction();
    const booking = buildEvent({ id: "booking-1", actionId: "action-1", source: "trax3ion", start: toIso(9, 0), end: toIso(11, 0) });
    const standup = buildEvent({ id: "standup-1", source: "outlook", title: "Internal Standup", start: toIso(9, 0), end: toIso(9, 30) });
    const events = [booking, standup];

    // Act
    const conflicts = getActionConflicts(action, events);

    // Assert
    expect(conflicts.map((event) => event.id)).toEqual(["standup-1"]);
  });

  it("should not treat the action's own booking as a conflict with itself", () => {
    // Arrange
    const action = buildAction();
    const booking = buildEvent({ id: "booking-1", actionId: "action-1", source: "trax3ion", start: toIso(9, 0), end: toIso(11, 0) });
    const events = [booking];

    // Act
    const conflicts = getActionConflicts(action, events);

    // Assert
    expect(conflicts).toEqual([]);
  });

  it("should ignore overlapping events for other resources", () => {
    // Arrange
    const action = buildAction();
    const booking = buildEvent({ id: "booking-1", actionId: "action-1", source: "trax3ion", start: toIso(9, 0), end: toIso(11, 0) });
    const otherResourceEvent = buildEvent({ id: "evt-other", resourceId: "res-2", source: "outlook", start: toIso(9, 0), end: toIso(9, 30) });
    const events = [booking, otherResourceEvent];

    // Act
    const conflicts = getActionConflicts(action, events);

    // Assert
    expect(conflicts).toEqual([]);
  });
});
