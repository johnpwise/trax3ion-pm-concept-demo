# frontend-testing-playbook.md

## Purpose

This playbook defines a reusable testing stance for React repositories.

## Default testing philosophy

Prefer the smallest useful set of tests that proves behavior, catches regressions, and remains easy to maintain.

## Mandatory sequencing

## Regression suite preservation

Treat existing tests as regression contracts for current behavior.

- preserve existing tests by default
- do not rewrite, weaken, or remove an existing assertion merely to fit a new implementation
- when a change introduces new behavior, add new tests first and keep prior coverage intact unless the prior contract is intentionally changing
- modify an existing test only when the product behavior is intentionally changing, the prior test is incorrect, or the test is too brittle/implementation-coupled to continue expressing the intended behavior
- when an existing test is changed, document the reason in the work summary or handoff in contract terms


This stack inherits sequencing and evidence gates from `agents-core`:
- `test_layer_matrix` must be explicit
- `required_preimplementation_tests` must fail before production code changes
- required `e2e_status` must be planned early and be `passing` before closeout

### Start with the first failing behavior
For non-trivial work:
1. identify the missing behavior
2. write the smallest failing test that proves it
3. implement the minimum code to pass
4. refactor only after green

### Prefer behavior-first coverage
Prioritize tests that validate:
- what the user sees
- what the user can do
- what happens after an action
- how the UI responds to async outcomes

Avoid spending most effort on:
- private helper implementation
- brittle DOM structure
- hook internals with no user-visible value

### Suggested coverage order
1. primary success path
2. loading and submitting states
3. error and recovery path
4. empty or missing-data path
5. edge conditions with meaningful regression risk

### Suggested test split
Usually prefer:
- a small number of high-signal component/integration tests
- focused unit tests for isolated transformation logic
- selective end-to-end coverage for truly important journeys, planned before implementation and finalized before closeout when required

### Selector policy for asserted targets
- for elements asserted in `component`, `integration`, or `e2e` tests, bind selectors from a colocated script/module-defined `*_TEST_IDS` constant object
- do not hard-code `data-id` selector values in JSX for asserted targets
- configure Testing Library with `testIdAttribute: "data-id"` before using `getByTestId` queries
- query asserted targets by configured `data-id` in component/integration tests (example: `screen.getByTestId(APP_SHELL_TEST_IDS.shell)`)
- use canonical Cypress selector syntax for asserted targets: `cy.get('[data-id="app-shell"]')`

### Common omissions to catch
- duplicate-submit protection
- disabled state behavior
- retry flows
- stale state after navigation or rerender
- ambiguous success messaging
- branch behavior hidden behind nullability
