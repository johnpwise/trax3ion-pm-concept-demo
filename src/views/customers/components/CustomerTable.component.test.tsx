import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import type { Customer, Project } from "../../../types/domain";
import CustomerTable from "./CustomerTable";

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

const customers: Customer[] = [{ id: "cust-1", name: "Acme Corp", status: "active" }];

const projects: Project[] = [
  { id: "proj-1", customerId: "cust-1", name: "Website Revamp", estimatedHours: 100, status: "active" },
  { id: "proj-2", customerId: "cust-1", name: "Archived Project", estimatedHours: 20, status: "inactive" },
];

describe("CustomerTable", () => {
  it("should render a table with each customer's project rollup on desktop viewports", () => {
    // Arrange
    mockMatchMedia(true);

    // Act
    render(
      <MemoryRouter>
        <CustomerTable customers={customers} projects={projects} />
      </MemoryRouter>,
    );

    // Assert
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("120h")).toBeInTheDocument();
  });

  it("should render a card list instead of a table on mobile viewports", () => {
    // Arrange
    mockMatchMedia(false);

    // Act
    render(
      <MemoryRouter>
        <CustomerTable customers={customers} projects={projects} />
      </MemoryRouter>,
    );

    // Assert
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open Acme Corp" })).toHaveAttribute("href", "/customers/cust-1");
    expect(screen.getByText("120h")).toBeInTheDocument();
  });
});
