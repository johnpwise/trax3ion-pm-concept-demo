# model-routing-policy.md

## Purpose

This document defines execution-profile routing guidance for the React stack pack, using the shared vocabulary in `agent-docs/routing/execution-profile-schema.md`, `agent-docs/routing/execution-profile-policy.md`, and `agent-docs/routing/reasoning-selection-policy.md`.

Baseline:
- use `routine` reasoning demand for straightforward, localized review or translation tasks
- use `elevated` reasoning demand for ambiguous, cross-boundary, or high-impact decisions
- use `deep` reasoning demand only for the hardest subset — subtle, tightly-coupled, or severe-consequence reasoning

`reasoning_demand` (how hard the thinking is) and `delegation` (whether a separate agent context does the work) are **independent**. Every escalation below raises `reasoning_demand` only; it runs in the primary context unless the Delegation Gate in `agent-docs/routing/reasoning-selection-policy.md` is separately met. A review lens applied by the agent that wrote the code is `delegation: inline`; use `delegation: independent` only when an isolated second opinion on a completed diff materially raises confidence (for example an authorization or shared-state change).

---

## Global Routing Rules

Use **`routine`** reasoning demand when all are true:
- scope is narrow and single-purpose
- the change impact is local
- behavior is already clear
- no approval-boundary decision is needed

Use **`elevated`** reasoning demand when any are true:
- the request is ambiguous or underspecified
- state ownership is unclear
- component boundaries or hook extraction are debatable
- API contract or nullability is unclear
- accessibility involves modal, focus, or validation complexity
- the test matrix spans async races or multiple UI states
- `test_layer_matrix` decisions (`unit`, `component`, `integration`, `e2e`) are unclear or contested
- `preimplementation_failing_test_evidence` is missing or contradictory

---

## Review lens defaults (`skills/review-change/`)

Every lens defaults to `review-routine` (`reasoning_demand: routine`), applied inline. Raise a lens
to `review-elevated` (`reasoning_demand: elevated`) only when that lens's own reasoning is hard:

- **correctness lens** — the diff is large, multiple interacting findings exist, state ownership is
  questionable, architectural drift is evident, or test-first evidence gates fail (missing
  `test_layer_matrix`, missing `preimplementation_failing_test_evidence`, or required `e2e_status`
  not passing at closeout).
- **accessibility lens** — dialogs or overlays, multi-step forms or validation flows, non-trivial
  focus restoration, or complex async recovery paths.
- **state-ownership lens** — start at `review-elevated` when ownership is contested or spans
  multiple features; drop to `review-routine` for narrow local-vs-lifted decisions with little
  downstream impact.
- **composition lens** — a new shared abstraction is proposed, component/hook boundaries affect
  multiple features, or tree-wide prop/context changes are being considered.

### api-contracts lens (`skills/review-change/references/api-contracts.md`)
Contract modelling at plan time and contract review in the diff. Default `architecture-elevated`
(`reasoning_demand: elevated`); drop to `planning-routine` only for additive field updates with
stable transport shapes or simple request/response extensions with no branching semantics.

---

## Escalation Criteria (Cross-Cutting)

These conditions require the Delivery Engineer to escalate the relevant lens or agent (per `agent-docs/routing/reasoning-selection-policy.md`) regardless of where they are first observed:

- **Shared client state ownership is contested or spans multiple features** -> raise the
  `review-change` state-ownership lens to `review-elevated` and the implementation step
  (`tdd-slice`) to `implementation-elevated`; treat `capability_owners.shared_client_state_tier: cross_feature` as a corroborating signal.
- **API contract change affects other consumers or has unclear backward compatibility** -> raise the `review-change` api-contracts lens to `review-elevated` and consult `architecture-advisor` at `architecture-elevated`.
- **Accessibility complexity involves modal/focus management or multi-step validation flows** -> raise the `review-change` accessibility lens to `review-elevated`.
- **The change is on a security, authorization, data-boundary, or cross-feature shared-state path** -> the Delegation Gate is met; delegate the review to `Independent-Reviewer`.

Whoever observes one of these conditions records it in `Escalation Reason` and must not silently continue at a lower profile.
