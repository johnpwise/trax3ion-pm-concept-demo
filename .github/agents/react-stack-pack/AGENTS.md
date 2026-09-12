# React Stack Pack - AGENTS.md

This document defines reusable React-stack guidance that can be inherited by React repositories on top of the shared core agent pack.

Repo-local `AGENTS.md` files should add project facts, exceptions, and approval boundaries. They should not repeat stack-wide policy unless the repo intentionally overrides it.

## 1. Scope

This stack pack targets modern React applications and internal tools using:

- React 19+
- strict TypeScript
- component and hook based architecture
- a layered client boundary between UI, state, and API/service concerns
- behavior-first testing
- accessibility-aware delivery

This pack is appropriate for:
- admin dashboards
- line-of-business tools
- CRUD-heavy UIs
- hybrid page/component architectures
- feature-oriented frontends

## 2. Defaults

Unless a repo-local overlay says otherwise, agents should assume:

- React functional components and hooks only
- strict TypeScript
- local state by default
- server state separated from client UI state
- composition over inheritance
- minimal diffs
- behavior-first tests
- semantic HTML first
- no `any`
- no speculative abstractions
- inherit core capability ownership and test-first evidence policy from `agents-core`
- follow the canonical frontend state-ownership ladder from `agents-core/agent-docs/standards/architecture/frontend-state-ownership-standards.md`
- feature workflow entry requires a leading `New Feature` trigger
- bug workflow entry requires a leading `Bug Fix` trigger
- requests using these React-stack triggers run in fail-closed mode until `.agent-workflows/<workflow_id>/index.md` and the first Worker Prompt Package artifact are persisted
- in React-stack fail-closed mode, the first response must report workflow ownership and routing state, not direct implementation
- in React-stack fail-closed mode, if trigger format or routing metadata is incomplete, request a correctly formatted reissue before code changes
- use `agent-docs/workflows/feature-workflow-routing.md` for feature routing and `agent-docs/workflows/bug-workflow-routing.md` for bug-fix routing overlays
- record each step per the core `handoff-template.md` (compact Step Record; full Cross-Context Handoff Package only for a separate agent context)
- default `Return To Agent` is `delivery-engineer.agent.md` unless incoming handoff explicitly overrides it
- keep workflow entry through `delivery-engineer`; one primary context then owns the slice end-to-end (plan/test/implement/verify/review as states)
- emit a completion block (artifact path + continue-workflow line) only for a cross-context dispatch or a workflow-owner reentry state
- continue in the primary context while `workflow_status: in-progress` and `reentry_reason: none`; re-enter the workflow-owner role explicitly for `blocked`, `awaiting-approval`, or `ready-for-closeout`
- review is applied inline via `skills/review-change/`: the correctness lens runs on every code change before closeout; the accessibility lens runs only when the diff changes interactive UI; the composition lens runs only when component/hook/context boundaries move; the state-ownership lens runs when owner/tier choice is unclear or state is shared across features
- delegate the review to `Independent-Reviewer` only when the Delegation Gate is met (e.g. an auth / data-boundary / cross-feature shared-state change)
- a blocking review-lens finding routes scoped rework inline, then the affected lenses re-run
- after the applicable review lenses pass with no blockers, the Delivery Engineer commits + pushes via the `commit-and-push` skill and records commit SHA(s) + push evidence (remote + branch/ref)
- `ready-for-closeout` is valid once commit-and-push returns with commit SHA(s) and push-success evidence; PR creation is never required for closeout
- a PR is opened only on an explicit, separate PR request recognised per the shared trigger-recognition standard in `agents-core/AGENTS.md`, via the `create-develop-pr` skill; never automatic after commit-and-push, and its output must be a live PR URL/number (artifact-only PR output is non-compliant); if creation fails, route that PR request `blocked` or `awaiting-approval` without reopening an already closeout-ready workflow

## 3. State model

Inherit the canonical decision ladder from `agents-core/agent-docs/standards/architecture/frontend-state-ownership-standards.md`.

Apply these React-specific mappings when setting frontend capability ownership:

1. `capability_owners.local_ui_state_owner`: local component state for component-local UI concerns
2. `capability_owners.shared_client_state_owner` with `capability_owners.shared_client_state_tier: subtree`: use context/lifted tree state when ownership naturally spans a subtree and prop composition becomes noisy
3. `capability_owners.shared_client_state_owner` with `capability_owners.shared_client_state_tier: cross_feature`: use broader store-based client state only for durable cross-page or cross-feature concerns
4. `capability_owners.server_state_owner`: dedicated server-state tooling for async remote data

Do not:
- duplicate server-fetched data into client stores without a strong reason
- use global state to avoid prop drilling prematurely
- persist temporary UI state globally unless the behavior truly spans navigation or sessions

## 4. API and data boundaries

Frontend code should prefer:

- service modules for remote calls
- typed boundary contracts
- explicit separation between transport DTO shapes and domain/UI-facing models when transport shape is not UI-safe
- mapping or normalization only when it reduces ambiguity
- explicit mapper naming patterns (for example: `mapXDtoToX`, `mapXToXDto`) when mapping is needed
- components consuming stable, frontend-safe shapes

Do not:
- call HTTP clients directly from components
- let transport uncertainty leak deeply into UI code
- blur DTO, domain, and UI-facing shapes into a single catch-all model
- hide type mismatches behind broad casts

## 5. Styling and accessibility

Use the repo's chosen styling system, but new work should generally follow:

- component-local styling ownership
- reusable primitives only when reuse pressure is real
- semantic controls before ARIA
- keyboard-operable flows
- clear loading, empty, error, disabled, and success states

## 6. Testing

This stack inherits the mandatory test-first lifecycle from `agents-core`.

React-specific testing guidance:

- start with the smallest failing test for missing behavior
- prefer component/integration tests over implementation-coupled tests
- for `*.component.test.tsx` formatting, AAA annotation/spacing, and required co-location rules, follow `agent-docs/standards/coding/component-test-file-coding-standards.md`
- for `*.unit.test.ts` formatting and AAA annotation/spacing rules, follow `agent-docs/standards/coding/unit-test-file-coding-standards.md`
- for Cypress test formatting and AAA annotation/spacing rules, follow `agent-docs/standards/coding/cypress-test-file-coding-standards.md`
- add unit tests for isolated transformation or branching logic where justified
- plan `e2e` coverage early and author/finalize it when the vertical flow exists
- discourage snapshot tests by default; prefer behavior-focused assertions
- preserve existing regression tests by default; do not alter or weaken them for new feature work or bug fixes unless the intended behavior contract is changing or the test is wrong/brittle
- only use snapshots when output is stable and presentation-heavy and the snapshot adds real signal

## 7. Agent collaboration

The shared core prompt/orchestration agents remain the workflow authority.
`delivery-engineer` (the Delivery Engineer) owns the slice end-to-end in one primary context and records each step per the core `handoff-template.md`.

This React pack ships **no agent files**. React-specific review, accessibility review,
state-ownership review, component-composition review, and API contract modelling are all inline
lenses of `skills/review-change/` (`references/{correctness,accessibility,react-composition,state-ownership,api-contracts}.md`).

Review is diff-classified. Exactly one lens is always-on — correctness — and every other lens runs only when the diff actually touches its concern (see `agent-docs/workflows/feature-workflow-routing.md`). Lenses are `delegation: inline` unless the Delegation Gate is met, in which case the review is delegated to `Independent-Reviewer`. Diff classification never relaxes mandatory fail-closed workflow intake, bootstrap artifacts, or the always-on correctness lens; the closeout step record lists which lenses ran and why each skipped one was skipped.

Frontend feature and bug review lenses (diff-classified — full trigger table in `agent-docs/workflows/feature-workflow-routing.md`), applied inline via `skills/review-change/`:
- correctness lens — runs on **every** code change before PR-ready closeout
- accessibility lens — only when the diff changes interactive UI
- composition lens — only when component/hook/context/abstraction boundaries move
- state-ownership lens — only when owner/tier choice is unclear or changing
- api-contracts lens — only when request/response/error shapes, nullability, or mapping boundaries are unclear or changing (contract modelling at plan time, contract review in the diff)
- commit + push via the `commit-and-push` skill after the applicable review lenses pass with no blockers, pushing successful commit(s); this alone makes the workflow closeout-ready
- the `create-develop-pr` skill runs only on an explicit, separate PR request; when requested, it must return a live PR URL/number
- closeout must be blocked/awaiting-approval when push fails; a failed explicitly-requested PR blocks only that request, never workflow closeout
- trivial feature fast-path is allowed only when scope is localized and clear, and must still enforce test-first/evidence/review gates
- trivial bug fast-path is allowed only when scope is localized and clear, and must still enforce test-first/evidence/review gates

## 8. Tool mapping responsibility

Concrete package and tooling mandates belong in repo-local overlays, not this stack pack.

Repo-local `AGENTS.md` overlays should map:

- `capability_owners.local_ui_state_owner` implementation expectations
- `capability_owners.shared_client_state_owner` to the chosen shared-state tool
- `capability_owners.shared_client_state_tier` (`subtree` | `cross_feature`) for new/updated frontend slices using `shared_client_state_owner`
- `capability_owners.server_state_owner` to the chosen server-state tool
- `test_layer_matrix` execution (`unit`, `component`, `integration`, `e2e`) to chosen test tooling
