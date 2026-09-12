import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import DayNavigator from "./DayNavigator";

afterEach(cleanup);

const day = new Date(2026, 2, 9); // Mon 9 Mar 2026

describe("DayNavigator", () => {
  it("should render the formatted day label", () => {
    // Arrange & Act
    render(<DayNavigator day={day} onPrevious={vi.fn()} onNext={vi.fn()} onToday={vi.fn()} />);

    // Assert
    expect(screen.getByText("Mon 9 Mar 2026")).toBeInTheDocument();
  });

  it("should call onPrevious, onNext and onToday when their buttons are clicked", () => {
    // Arrange
    const onPrevious = vi.fn();
    const onNext = vi.fn();
    const onToday = vi.fn();
    render(<DayNavigator day={day} onPrevious={onPrevious} onNext={onNext} onToday={onToday} />);

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Previous day" }));
    fireEvent.click(screen.getByRole("button", { name: "Next day" }));
    fireEvent.click(screen.getByRole("button", { name: "Today" }));

    // Assert
    expect(onPrevious).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onToday).toHaveBeenCalledTimes(1);
  });
});
