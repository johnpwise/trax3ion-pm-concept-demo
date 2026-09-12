import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import type { Resource } from "../../types/domain";
import ResourceSelect from "./ResourceSelect";
import { RESOURCE_SELECT_TEST_IDS } from "./ResourceSelect.testIds";

afterEach(cleanup);

const resources: Resource[] = [
  { id: "res-sarah", name: "Sarah Chen", role: "Senior Consultant", status: "active" },
  { id: "res-naomi", name: "James Okoye", role: "Consultant", status: "active" },
];

describe("ResourceSelect", () => {
  it("should filter the resource list as the user types", () => {
    // Arrange
    render(<ResourceSelect resources={resources} onChange={vi.fn()} />);
    fireEvent.click(screen.getByTestId(RESOURCE_SELECT_TEST_IDS.trigger));

    // Act
    fireEvent.change(screen.getByTestId(RESOURCE_SELECT_TEST_IDS.search), { target: { value: "sar" } });

    // Assert
    expect(screen.getByText("Sarah Chen")).toBeInTheDocument();
    expect(screen.queryByText("James Okoye")).not.toBeInTheDocument();
  });

  it("should call onChange with the selected resource id", () => {
    // Arrange
    const onChange = vi.fn();
    render(<ResourceSelect resources={resources} onChange={onChange} />);
    fireEvent.click(screen.getByTestId(RESOURCE_SELECT_TEST_IDS.trigger));

    // Act
    fireEvent.click(screen.getByText("James Okoye"));

    // Assert
    expect(onChange).toHaveBeenCalledWith("res-naomi");
  });

  it("should not bubble a click on the panel to a parent onClick handler", () => {
    // Arrange
    const parentClick = vi.fn();
    render(
      <div onClick={parentClick}>
        <ResourceSelect resources={resources} onChange={vi.fn()} />
      </div>,
    );
    fireEvent.click(screen.getByTestId(RESOURCE_SELECT_TEST_IDS.trigger));
    parentClick.mockClear();

    // Act
    fireEvent.click(screen.getByText("James Okoye"));

    // Assert
    expect(parentClick).not.toHaveBeenCalled();
  });

  it("should render read-only text with no dropdown affordance when onChange is omitted", () => {
    // Arrange
    render(<ResourceSelect resources={resources} value="res-naomi" />);

    // Act / Assert
    expect(screen.getByText("James Okoye")).toBeInTheDocument();
    expect(screen.queryByTestId(RESOURCE_SELECT_TEST_IDS.trigger)).not.toBeInTheDocument();
  });
});
