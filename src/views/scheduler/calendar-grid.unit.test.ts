import { describe, expect, it } from "vitest";

import {
  DEFAULT_HOUR_RANGE,
  MIN_EVENT_HEIGHT_PX,
  PX_PER_HOUR,
  computeEventVerticalLayout,
  getVisibleHourRange,
  packOverlappingEvents,
} from "./calendar-grid";

const DAY = "2026-03-09"; // a Monday

function iso(hour: number, minute = 0): string {
  return `${DAY}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
}

describe("getVisibleHourRange", () => {
  it("should return the default range unchanged when there are no events", () => {
    // Arrange & Act
    const range = getVisibleHourRange([]);

    // Assert
    expect(range).toEqual(DEFAULT_HOUR_RANGE);
  });

  it("should floor the start hour when an event starts before the default range", () => {
    // Arrange
    const events = [{ start: iso(6, 30), end: iso(8, 0) }];

    // Act
    const range = getVisibleHourRange(events);

    // Assert
    expect(range.startHour).toBe(6);
  });

  it("should ceil the end hour when an event ends after the default range", () => {
    // Arrange
    const events = [{ start: iso(18, 0), end: iso(19, 30) }];

    // Act
    const range = getVisibleHourRange(events);

    // Assert
    expect(range.endHour).toBe(20);
  });

  it("should leave the range unchanged when all events fall within it", () => {
    // Arrange
    const events = [{ start: iso(9, 0), end: iso(17, 0) }];

    // Act
    const range = getVisibleHourRange(events);

    // Assert
    expect(range).toEqual(DEFAULT_HOUR_RANGE);
  });

  it("should clamp an extreme event to the 0-24 bounds", () => {
    // Arrange
    const events = [{ start: `${DAY}T00:00:00`, end: `2026-03-10T01:00:00` }];

    // Act
    const range = getVisibleHourRange(events);

    // Assert
    expect(range.startHour).toBeGreaterThanOrEqual(0);
    expect(range.endHour).toBeLessThanOrEqual(24);
  });
});

describe("computeEventVerticalLayout", () => {
  it("should compute exact top and height for a 09:00-17:00 event", () => {
    // Arrange
    const event = { start: iso(9, 0), end: iso(17, 0) };

    // Act
    const layout = computeEventVerticalLayout(event, DEFAULT_HOUR_RANGE);

    // Assert
    expect(layout.topPx).toBe((9 - DEFAULT_HOUR_RANGE.startHour) * PX_PER_HOUR);
    expect(layout.heightPx).toBe(8 * PX_PER_HOUR);
  });

  it("should place an event starting at range.startHour at the top edge", () => {
    // Arrange
    const event = { start: iso(DEFAULT_HOUR_RANGE.startHour, 0), end: iso(DEFAULT_HOUR_RANGE.startHour + 1, 0) };

    // Act
    const layout = computeEventVerticalLayout(event, DEFAULT_HOUR_RANGE);

    // Assert
    expect(layout.topPx).toBe(0);
  });

  it("should not inflate a 30-minute event beyond the minimum height", () => {
    // Arrange
    const event = { start: iso(10, 0), end: iso(10, 30) };

    // Act
    const layout = computeEventVerticalLayout(event, DEFAULT_HOUR_RANGE);

    // Assert
    expect(layout.heightPx).toBe(MIN_EVENT_HEIGHT_PX);
  });

  it("should inflate a 15-minute event up to the minimum height", () => {
    // Arrange
    const event = { start: iso(10, 0), end: iso(10, 15) };

    // Act
    const layout = computeEventVerticalLayout(event, DEFAULT_HOUR_RANGE);

    // Assert
    expect(layout.heightPx).toBe(MIN_EVENT_HEIGHT_PX);
  });

  it("should not throw and should floor to the minimum height for a zero-duration event", () => {
    // Arrange
    const event = { start: iso(10, 0), end: iso(10, 0) };

    // Act
    const layout = computeEventVerticalLayout(event, DEFAULT_HOUR_RANGE);

    // Assert
    expect(layout.heightPx).toBe(MIN_EVENT_HEIGHT_PX);
  });

  it("should clip without negative values for an event fully before the visible range", () => {
    // Arrange
    const event = { start: iso(4, 0), end: iso(5, 0) };

    // Act
    const layout = computeEventVerticalLayout(event, DEFAULT_HOUR_RANGE);

    // Assert
    expect(layout.topPx).toBeGreaterThanOrEqual(0);
    expect(layout.heightPx).toBeGreaterThan(0);
  });

  it("should clip without overflow for an event fully after the visible range", () => {
    // Arrange
    const event = { start: iso(22, 0), end: iso(23, 0) };

    // Act
    const layout = computeEventVerticalLayout(event, DEFAULT_HOUR_RANGE);

    // Assert
    const maxTop = (DEFAULT_HOUR_RANGE.endHour - DEFAULT_HOUR_RANGE.startHour) * PX_PER_HOUR;
    expect(layout.topPx).toBeLessThanOrEqual(maxTop);
    expect(Number.isNaN(layout.topPx)).toBe(false);
    expect(Number.isNaN(layout.heightPx)).toBe(false);
  });
});

describe("packOverlappingEvents", () => {
  it("should return an empty array for no events", () => {
    // Arrange & Act
    const result = packOverlappingEvents([]);

    // Assert
    expect(result).toEqual([]);
  });

  it("should give every event column 0 of 1 when none overlap", () => {
    // Arrange
    const events = [
      { start: iso(9, 0), end: iso(10, 0) },
      { start: iso(11, 0), end: iso(12, 0) },
    ];

    // Act
    const packed = packOverlappingEvents(events);

    // Assert
    expect(packed.every((p) => p.columnIndex === 0 && p.columnCount === 1)).toBe(true);
  });

  it("should not treat a touching boundary as an overlap", () => {
    // Arrange
    const events = [
      { start: iso(9, 0), end: iso(10, 0) },
      { start: iso(10, 0), end: iso(11, 0) },
    ];

    // Act
    const packed = packOverlappingEvents(events);

    // Assert
    expect(packed.every((p) => p.columnCount === 1)).toBe(true);
  });

  it("should split two overlapping events into two columns", () => {
    // Arrange
    const events = [
      { start: iso(9, 0), end: iso(10, 0) },
      { start: iso(9, 30), end: iso(10, 30) },
    ];

    // Act
    const packed = packOverlappingEvents(events);

    // Assert
    expect(packed.every((p) => p.columnCount === 2)).toBe(true);
    expect(new Set(packed.map((p) => p.columnIndex)).size).toBe(2);
  });

  it("should split a three-way overlap into three columns with unique indices", () => {
    // Arrange
    const events = [
      { start: iso(9, 0), end: iso(10, 30) },
      { start: iso(9, 15), end: iso(10, 15) },
      { start: iso(9, 30), end: iso(10, 0) },
    ];

    // Act
    const packed = packOverlappingEvents(events);

    // Assert
    expect(packed.every((p) => p.columnCount === 3)).toBe(true);
    expect(new Set(packed.map((p) => p.columnIndex))).toEqual(new Set([0, 1, 2]));
  });

  it("should chain an indirect overlap (A-B, B-C, but not A-C) into one live cluster and reuse A's freed column for C", () => {
    // Arrange: A 9:00-10:00, B 9:30-10:30, C 10:15-11:00 — A and C never overlap directly,
    // and max concurrency at any instant is 2 (A+B, then B+C), so C reuses A's column
    // once A has ended rather than forcing a 3rd column.
    const events = [
      { start: iso(9, 0), end: iso(10, 0) },
      { start: iso(9, 30), end: iso(10, 30) },
      { start: iso(10, 15), end: iso(11, 0) },
    ];

    // Act
    const packed = packOverlappingEvents(events);

    // Assert
    expect(packed.every((p) => p.columnCount === 2)).toBe(true);
    expect(packed[0].columnIndex).toBe(packed[2].columnIndex);
  });

  it("should reset clusters so two independent overlaps in the same day get their own column counts", () => {
    // Arrange: a morning overlapping pair, and an unrelated afternoon singleton
    const events = [
      { start: iso(9, 0), end: iso(10, 0) },
      { start: iso(9, 30), end: iso(10, 30) },
      { start: iso(14, 0), end: iso(15, 0) },
    ];

    // Act
    const packed = packOverlappingEvents(events);

    // Assert
    expect(packed[0].columnCount).toBe(2);
    expect(packed[1].columnCount).toBe(2);
    expect(packed[2].columnCount).toBe(1);
  });

  it("should preserve input order in the output regardless of internal sorting", () => {
    // Arrange: input deliberately out of chronological order
    const events = [
      { start: iso(14, 0), end: iso(15, 0) },
      { start: iso(9, 0), end: iso(10, 0) },
      { start: iso(9, 30), end: iso(10, 30) },
    ];

    // Act
    const packed = packOverlappingEvents(events);

    // Assert
    expect(packed.map((p) => p.event)).toEqual(events);
  });
});
