# react-feature-intake.prompt.md

Use this when the core prompt/orchestration agent needs a React-aware intake pass before dispatching work.

## Intake policy

- Feature intake requires the request to start with `New Feature`.
- If the trigger is missing, do not dispatch a feature workflow; request a correctly triggered reissue first.
- After trigger validation, normalize the request, then plan and deliver it in a single primary context (plan → BDD → RED → GREEN → REFACTOR → verify → review lenses → commit). Delegate to a separate agent context only when the Delegation Gate is met.
- Under workflow triggers, use fail-closed behavior: no implementation edits before workflow artifacts are bootstrapped and the required RED evidence exists.
- For new/updated frontend slices, when `capability_owners.shared_client_state_owner` is present, require `capability_owners.shared_client_state_tier` (`subtree` | `cross_feature`).

## Reusable trigger template

```text
Use agent spec: Delivery-Engineer
New Feature
<feature summary>
```

## Capture
- user-visible behavior requested
- affected screens, routes, or feature areas
- expected loading, error, empty, disabled, and success states
- `capability_owners.local_ui_state_owner` candidate
- `capability_owners.shared_client_state_owner` candidate
- `capability_owners.shared_client_state_tier` candidate (`subtree` | `cross_feature`) when shared client ownership is in scope
- `capability_owners.server_state_owner` candidate
- remote data involved
- forms, keyboard flow, or accessibility-sensitive interactions
- whether the change appears local, subtree-wide, or cross-page
- `test_layer_matrix` (`unit`, `component`, `integration`, `e2e`) with `required`/`N/A` rationale
- `required_preimplementation_tests` for `unit`/`component` and relevant `integration`
- `preimplementation_failing_test_evidence` expectations
- `e2e_status` plan (`planned` before implementation, `passing` before closeout when required)
- overlay tool-mapping impact (does repo overlay need updates for capability->tool mapping?)
- complexity signals for planner classification (`trivial` or `non-trivial`)

## Early routing hints

Do all of this inline in the primary context unless the Delegation Gate is met
(`.github/agents/agents-core/agent-docs/routing/reasoning-selection-policy.md`):

- planning — complexity classification and increment sequencing
- test strategy — `test_layer_matrix` and pre-implementation failing-test design
- state-ownership when state location is unclear; contract modelling when transport shapes or nullability are unclear
- review lenses, diff-classified (see `agent-docs/workflows/feature-workflow-routing.md`): correctness always; every other lens only when the diff touches it
- commit + push via the `commit-and-push` skill once the applicable lenses pass

Use a separate agent context only for an isolated review of an authorization / shared-state /
transaction-boundary change (`delegation: independent`), or genuinely independent parallel
workstreams (`delegation: parallel`).

## Intake output shape
Return:
- feature summary
- scope
- assumptions
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
