import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import type { Customer, Phase, Project } from "../../../types/domain";
import ProjectTable from "./ProjectTable";

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

const customersById = new Map<string, Customer>([["cust-1", { id: "cust-1", name: "Acme Corp", status: "active" }]]);

const projects: Project[] = [
  { id: "proj-1", customerId: "cust-1", name: "Website Revamp", code: "WR-01", estimatedHours: 100, status: "active" },
];

const phases: Phase[] = [{ id: "phase-1", projectId: "proj-1", name: "Design", estimatedHours: 40, status: "active", sortOrder: 1 }];

describe("ProjectTable", () => {
  it("should render a table with the project's figures on desktop viewports", () => {
    // Arrange
    mockMatchMedia(true);

    // Act
    render(
      <MemoryRouter>
        <ProjectTable projects={projects} customersById={customersById} phases={phases} />
      </MemoryRouter>,
    );

    // Assert
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Website Revamp")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("60h")).toBeInTheDocument();
  });

  it("should render a card list instead of a table on mobile viewports", () => {
    // Arrange
    mockMatchMedia(false);

    // Act
    render(
      <MemoryRouter>
        <ProjectTable projects={projects} customersById={customersById} phases={phases} />
      </MemoryRouter>,
    );

    // Assert
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open Website Revamp" })).toHaveAttribute("href", "/projects/proj-1");
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("60h")).toBeInTheDocument();
  });
});
