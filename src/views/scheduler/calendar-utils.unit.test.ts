import { describe, expect, it } from "vitest";

import { formatDayLabel, formatEventDate, getWeekdayIndex } from "./calendar-utils";

describe("getWeekdayIndex", () => {
  it("should map Monday to 0 and Friday to 4", () => {
    // Arrange
    const monday = new Date(2026, 2, 9); // 2026-03-09 is a Monday
    const friday = new Date(2026, 2, 13);

    // Act & Assert
    expect(getWeekdayIndex(monday)).toBe(0);
    expect(getWeekdayIndex(friday)).toBe(4);
  });

  it("should clamp both weekend days to 0", () => {
    // Arrange
    const saturday = new Date(2026, 2, 14);
    const sunday = new Date(2026, 2, 15);

    // Act & Assert
    expect(getWeekdayIndex(saturday)).toBe(0);
    expect(getWeekdayIndex(sunday)).toBe(0);
  });
});

describe("formatDayLabel", () => {
  it("should format a date as 'Weekday D Mon YYYY'", () => {
    // Arrange
    const date = new Date(2026, 2, 9);

    // Act
    const label = formatDayLabel(date);

    // Assert
    expect(label).toBe("Mon 9 Mar 2026");
  });
});

describe("formatEventDate", () => {
  it("should format an ISO string the same way as formatDayLabel", () => {
    // Arrange
    const iso = "2026-03-09T09:00:00";

    // Act & Assert
    expect(formatEventDate(iso)).toBe(formatDayLabel(new Date(iso)));
  });
});
