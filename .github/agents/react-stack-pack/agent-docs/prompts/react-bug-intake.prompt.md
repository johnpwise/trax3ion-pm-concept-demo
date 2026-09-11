# react-bug-intake.prompt.md

Use this when the core prompt/orchestration agent needs a React-aware bug-intake pass before dispatching work.

## Intake policy

- Bug intake requires the request to start with `Bug Fix`.
- If the trigger is missing, do not dispatch a bug workflow; request a correctly triggered reissue first.
- After trigger validation, normalize the report into explicit behavior, repro, and validation expectations, then plan and deliver the fix in a single primary context (repro → RED → GREEN → REFACTOR → verify → review lenses → commit). Delegate to a separate agent context only when the Delegation Gate is met.
- Under workflow triggers, use fail-closed behavior: no implementation edits before workflow artifacts are bootstrapped and the required RED evidence exists.
- For new/updated frontend slices, when `capability_owners.shared_client_state_owner` is present, require `capability_owners.shared_client_state_tier` (`subtree` | `cross_feature`).

## Reusable trigger template

```text
Use agent spec: Delivery-Engineer
Bug Fix
<problem summary>
```

## Capture

- bug summary and user-visible impact
- affected screens, routes, feature areas, and likely modules
- current behavior (actual) vs expected behavior
- reproducibility and repro steps
- frequency and affected user segment
- relevant logs, screenshots, traces, or error signatures
- expected loading, error, empty, disabled, and recovery states
- `capability_owners.local_ui_state_owner` candidate
- `capability_owners.shared_client_state_owner` candidate
- `capability_owners.shared_client_state_tier` candidate (`subtree` | `cross_feature`) when shared client ownership is in scope
- `capability_owners.server_state_owner` candidate
- remote data/contracts involved and suspected API boundaries
- forms, keyboard flow, focus, or accessibility-sensitive interactions
- complexity signals indicating localized (`trivial`) vs cross-boundary (`non-trivial`) scope
- `test_layer_matrix` (`unit`, `component`, `integration`, `e2e`) with `required`/`N/A` rationale
- `required_preimplementation_tests` for `unit`/`component` and relevant `integration`
- `preimplementation_failing_test_evidence` expectations
- `e2e_status` plan (`planned` before implementation, `passing` before closeout when required)

## Early routing hints

Do all of this inline in the primary context unless the Delegation Gate is met
(`.github/agents/agents-core/agent-docs/routing/reasoning-selection-policy.md`):

- planning — complexity classification and increment sequencing
- test strategy — `test_layer_matrix` and pre-implementation failing-test design
- state-ownership when state location is unclear; contract modelling when nullability/error-shape assumptions are unclear
- review lenses, diff-classified (see `agent-docs/workflows/bug-workflow-routing.md`): correctness always; every other lens only when the diff touches it
- commit + push via the `commit-and-push` skill once the applicable lenses pass

Use a separate agent context only for an isolated review of an authorization / shared-state /
transaction-boundary change (`delegation: independent`), or genuinely independent parallel
workstreams (`delegation: parallel`).

## Intake output shape

Return:

- bug summary
- actual behavior
- expected behavior
- reproducible steps and evidence summary
- scope and assumptions
- complexity signals and constraints for planner classification
- `capability_owners.local_ui_state_owner`
- `capability_owners.shared_client_state_owner`
- `capability_owners.shared_client_state_tier` (`subtree` | `cross_feature`) when `shared_client_state_owner` is present
- `capability_owners.server_state_owner`
- likely contract surface
- `test_layer_matrix` (`required`/`N/A` + rationale)
- `required_preimplementation_tests`
- `preimplementation_failing_test_evidence` expectations
- `e2e_status` plan and closeout expectation
- which diff-triggered review lenses apply, and rework-loop expectations
- recommended next agent
