describe("application preferences", () => {
  it("should toggle dark mode and change theme", () => {
    // Arrange
    cy.visit("/");
    cy.get('[data-id="app-shell"]').should("have.class", "bg-background");

    // Act
    cy.get('[data-id="mode-toggle-button"]').click();
    cy.get('[data-id="theme-picker-select"]').select("theme-ocean");

    // Assert
    cy.get('[data-id="mode-toggle-label"]').should("contain", "Mode is dark");
    cy.get("html").should("have.attr", "data-theme", "theme-ocean");
    cy.get('[data-id="theme-picker-select"]').should("have.class", "bg-surface");
  });
});
