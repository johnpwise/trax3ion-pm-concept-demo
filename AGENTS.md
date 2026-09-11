# AGENTS.md

This app inherits shared workflow rules and React stack guidance from:

- `.github/agents/agents-core/AGENTS.md`
- `.github/agents/react-stack-pack/AGENTS.md`

## Project Facts

- Stack: React 18+ + TypeScript + Vite
- Routing: React Router (`src/router/index.ts`)
- Local/shared state: Zustand (`src/store/appStore.ts`)
- Server-state: React Query
- HTTP boundary: Axios instance in `src/lib/http.ts`

## capability_owners

- `local_ui_state_owner`: React local state/hooks
- `shared_client_state_owner`: Zustand
- `server_state_owner`: React Query + Axios boundary

## test_layer_matrix

- `unit`: `npm run test:unit`
- `component`: `npm run test:component`
- `integration`: `npm run test`
- `e2e`: `npm run test:e2e`

### Working model

Agents should behave like junior developers being trained into this workflow.

### Agent instruction sources

1. root `AGENTS.md` (authoritative repo rules)
2. `.github/agents/react-stack-pack/AGENTS.md` and `.github/agents/react-stack-pack/agent-docs/...` (React stack baseline)
3. `.github/agents/agents-core/AGENTS.md` and `.github/agents/agents-core/agent-docs/...` (core workflow baseline)

### Workflow inheritance sync

This repo inherits workflow defaults from `.github/agents/agents-core` and `.github/agents/react-stack-pack`.

### Coding standards inheritance

Coding standards for generated React code/tests are inherited from:

- `.github/agents/react-stack-pack/agent-docs/standards/coding/*.md`
- applicable quality/workflow constraints from `.github/agents/agents-core/AGENTS.md` and `.github/agents/agents-core/agent-docs/...`

### Policy ownership map

* `agents-core`: stack-neutral workflow governance, fail-closed mechanics, handoff/checkpoint contract, and test-evidence lifecycle.
* `react-stack-pack`: React workflow triggers/gates plus React API/state/testing coding conventions.
* root `AGENTS.md`: project-specific runtime/tooling facts, architecture direction, local conventions, and concrete capability/test-tool mapping.

### Local workflow override

* Workflow artifacts must be persisted in `.agent-workflows/<workflow_id>/` for file-first routing.
* After workflow status is `closed`, `.agent-workflows/<workflow_id>/` must be deleted to avoid artifact buildup.

### Inherited workflow defaults (no local override)

* `delivery-engineer` remains the active workflow owner.
* Feature workflow entry requires a leading `New Feature` trigger.
* Bug workflow entry requires a leading `Bug Fix` trigger.
* one primary context owns the slice; re-enter the workflow-owner role only for blocked/awaiting-approval/ready-for-closeout.
* Complexity is classified `trivial` vs `non-trivial` and delivery is sequenced into TDD increments inline.
* The `skills/review-change/` correctness lens is always required; accessibility, composition, and state-ownership lenses are diff-classified.
* API contract modelling is a plan-time use of the `skills/review-change/` api-contracts lens.
