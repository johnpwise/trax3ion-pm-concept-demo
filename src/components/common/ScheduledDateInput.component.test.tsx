import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { formatScheduledDate } from "./scheduledDate";
import ScheduledDateInput from "./ScheduledDateInput";
import { SCHEDULED_DATE_INPUT_TEST_IDS } from "./ScheduledDateInput.testIds";

afterEach(cleanup);

describe("ScheduledDateInput", () => {
  it("should render read-only formatted text with no input when onChange is omitted", () => {
    // Arrange
    render(<ScheduledDateInput value="2026-09-15" />);

    // Act / Assert
    expect(screen.getByText(formatScheduledDate("2026-09-15"))).toBeInTheDocument();
    expect(screen.queryByTestId(SCHEDULED_DATE_INPUT_TEST_IDS.input)).not.toBeInTheDocument();
  });

  it("should render a read-only placeholder when there is no value", () => {
    // Arrange
    render(<ScheduledDateInput />);

    // Act / Assert
    expect(screen.getByText("No date")).toBeInTheDocument();
  });

  it("should call onChange with the selected date", () => {
    // Arrange
    const onChange = vi.fn();
    render(<ScheduledDateInput onChange={onChange} />);

    // Act
    fireEvent.change(screen.getByTestId(SCHEDULED_DATE_INPUT_TEST_IDS.input), { target: { value: "2026-09-15" } });

    // Assert
    expect(onChange).toHaveBeenCalledWith("2026-09-15");
  });

  it("should call onChange with undefined when the date is cleared", () => {
    // Arrange
    const onChange = vi.fn();
    render(<ScheduledDateInput value="2026-09-15" onChange={onChange} />);

    // Act
    fireEvent.change(screen.getByTestId(SCHEDULED_DATE_INPUT_TEST_IDS.input), { target: { value: "" } });

    // Assert
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("should not bubble a click on the input to a parent onClick handler", () => {
    // Arrange
    const parentClick = vi.fn();
    render(
      <div onClick={parentClick}>
        <ScheduledDateInput onChange={vi.fn()} />
      </div>,
    );

    // Act
    fireEvent.click(screen.getByTestId(SCHEDULED_DATE_INPUT_TEST_IDS.input));

    // Assert
    expect(parentClick).not.toHaveBeenCalled();
  });
});
