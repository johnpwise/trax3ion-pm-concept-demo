# react-stack-policy.md

## Purpose

This document captures reusable React stack policy that can be inherited by multiple repos.

Repo overlays should keep only facts and exceptions.

## Policy Baseline

### React
- React 19+ patterns only
- React functional components and hooks only
- composition over inheritance
- avoid legacy lifecycle-era patterns

### TypeScript
- assume `strict: true`
- no `any`
- prefer explicit object shapes
- avoid broad casts that suppress real boundary problems

### State
- apply core `capability_owners` with frontend keys: `local_ui_state_owner`, `shared_client_state_owner`, `server_state_owner`
- when `shared_client_state_owner` is used, include `capability_owners.shared_client_state_tier` with `subtree` or `cross_feature`
- in React, prefer local state first, context/lifted tree state for `shared_client_state_tier: subtree`, and broader store-based state only for `shared_client_state_tier: cross_feature`
- remote data should not be mirrored into client state without strong justification

### API boundaries
- components should not call HTTP clients directly
- service modules should own transport details
- transport ambiguity should be normalized or modeled explicitly at the boundary

### Styling
- follow the repo styling system
- new work should keep styling ownership close to the component/feature
- do not introduce new styling paradigms without approval

### Frontend directory organization
- create shared components under `src/components/`
- each component should be contained in its own kebab-case folder (for example `mode-toggle`)
- component tests must be colocated with their same-named component and selector files in that folder
- canonical component structure: `src/components/mode-toggle/ModeToggle.tsx`, `src/components/mode-toggle/ModeToggle.component.test.tsx`, and `src/components/mode-toggle/ModeToggle.testIds.ts`
- create views under `src/views/<kebab-view-name>/`
- colocate each view file with its companion test and selector files when present
- canonical view structure: `src/views/home/HomeView.tsx`, `src/views/home/HomeView.component.test.tsx`, and `src/views/home/HomeView.testIds.ts`
- under `src/features/`, any UI unit with paired `*.tsx` and `*.test.tsx` files should live in its own kebab-case subfolder with its selector constants beside it
- avoid flat folders that mix multiple UI units and their tests/selectors at the same directory level
- the only source-root exception is `src/App.component.test.tsx`, which may live beside `src/App.tsx`; all other component tests must be in a named UI-unit folder under `src/components/`, `src/views/`, `src/features/`, or `src/app/`

### Test selectors
- for elements asserted in `component`, `integration`, or `e2e` tests, define test IDs from script/module scope in a colocated `*.testIds.ts` file owned by the component, view, feature unit, or app shell
- do not create monolithic app-wide selector files such as `src/app/testIds.ts`
- `*_TEST_IDS` object keys should be `camelCase`; values should be stable, descriptive strings
- bind asserted target selectors with `data-id={APP_SHELL_TEST_IDS.shell}` rather than hard-coded `data-id` selector values in JSX/TSX
- require `data-id` only for asserted targets; do not add it indiscriminately to every element

### Quality gates
- inherit mandatory core test-first and evidence gates (`test_layer_matrix`, `preimplementation_failing_test_evidence`, required `e2e_status=passing` before closeout)
- lint and build should pass before closeout
- keep diffs scoped and reversible
- avoid unrelated cleanup in feature work

### Tooling policy boundary
- this stack pack stays tool-agnostic for package selection
- repo-local overlays should map frontend `capability_owners` keys to concrete packages and test tools
- dependency/tool changes are assessed inline with `skills/dependency-assessment/`

### Housekeeping
- comments in the code are permissible
- You must not leave comented out code. Single lines or blocks
