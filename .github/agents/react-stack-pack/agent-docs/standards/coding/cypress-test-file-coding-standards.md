# react-cypress-test-file-policy.md

## Purpose

This document defines formatting and structure standards for Cypress test files in React-based repos that inherit this stack pack.

Repo overlays should keep only facts and exceptions.

## Formatting Baseline

## Existing test preservation
- treat the file's current assertions as a regression contract unless the intended behavior is explicitly changing
- do not weaken or delete an existing assertion merely to make a new implementation pass
- prefer adding new test cases for new behavior over rewriting existing ones
- if an existing test must change, keep the replacement focused on the same intended behavior and update it only as much as the contract change requires


### File scope
- each Cypress test file should target one user-visible flow or behavior contract
- keep test setup in-file unless it is shared by 2+ test files
- avoid unrelated helper logic in the test file; move reusable setup to a Cypress support utility module

### Import layout
- keep imports minimal; prefer Cypress built-ins and support commands over local helper sprawl
- order imports as: Cypress support modules, app test data/builders, local test utilities
- keep one import per line and group blocks with a single blank line

### Test structure
- one top-level `describe("<flow or page>")` block per file
- use `it("should ...")` phrasing for test names
- keep each test in Arrange-Act-Assert order with clear visual separation via blank lines
- require explicit AAA comment headers in every test: `// Arrange`, `// Act`, `// Assert`
- keep AAA blocks in strict order with no interleaving of actions and assertions
- separate AAA blocks with exactly one blank line between sections
- test names should communicate scenario and expected outcome
- prefer deterministic setup in `// Arrange` and keep navigation/interactions in `// Act`

Canonical pattern:

```ts
describe("app shell", () => {
  it("should render app shell", () => {
    // Arrange

    // Act
    cy.visit("/");

    // Assert
    cy.get('[data-id="app-shell"]').should("exist");
  });
});
```

### Selector and query usage
- for asserted UI targets, prefer stable selectors owned by the app contract (for example, colocated `data-id` conventions)
- avoid brittle selectors based on CSS class names, DOM depth, or framework-generated attributes
- keep selectors intention-revealing and scoped to the behavior under test

### Mocking and test doubles
- mock only external boundaries where determinism requires it (network, clock, random, cross-origin dependencies)
- prefer `cy.intercept` with explicit route intent over broad wildcard interception
- keep stubs/fixtures local to the tests that rely on them and reset state between tests

### Assertions and async handling
- keep one behavioral concern per test case
- keep one primary assertion per test; tightly related follow-up assertions are allowed only when they validate the same behavior
- place assertions only in the `// Assert` section
- prefer explicit Cypress assertions over broad snapshots
- avoid arbitrary waits; synchronize through Cypress retries and explicit app-state signals
- test output should be deterministic across local and CI runs

### Quality gate alignment
- test files must satisfy lint and type-check gates
- changes should preserve test readability under standard formatter output
- keep diffs scoped to the user-visible behavior being validated
