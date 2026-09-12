# bug-workflow-routing.md

## Purpose

This document defines React-specific bug workflow routing deltas that overlay `agents-core` bug workflow routing.

Inherit baseline ownership, routing metadata semantics, artifact persistence/index/bootstrap/cleanup behavior, intake/classification flow, and mandatory gate rules from:

- `agents-core/agent-docs/workflows/bug-workflow-routing.md`

## Stack-specific review gates (diff-classified)

Classify the diff and run only the lenses it actually touches, applied inline via
`skills/review-change/` (`references/`). Every lens is `delegation: inline` unless the Delegation
Gate is separately met, in which case the review is delegated to `Independent-Reviewer`.

| Lens (`skills/review-change/references/`) | When it runs |
| --- | --- |
| `correctness.md` | **Always.** Every code change. |
| `accessibility.md` | When the fix changes interactive UI — user-visible markup, focus/keyboard behavior, dialogs/overlays, forms, or ARIA. Skip for pure logic/util/test-only fixes. |
| `react-composition.md` | When the fix adds or reshapes components, hooks, context, or a shared abstraction. Skip when no component/hook boundary moves. |
| `state-ownership.md` | When owner choice or `capability_owners.shared_client_state_tier` (`subtree` vs `cross_feature`) is unclear, or state is lifted/shared across features. |
| `api-contracts.md` | When request/response/error shapes, nullability, or mapping boundaries change. |
| `architecture-advisor` | When ownership, layering, public contracts, or module boundaries change or are unclear. |
| `skills/dependency-assessment/` | New dependencies or material dependency/tooling/runtime changes (inline; escalate unusual ones to the user). |

Contract modelling happens at plan time (`skills/feature-planning/`); the api-contracts lens then reviews the change in the diff.

The classification and the set of lenses run (with a one-line reason for each skip) is recorded in
the closeout step record.

## Required gate reminder

- The correctness lens plus every diff-triggered lens above must be complete with no blocking findings before PR-ready closeout.
- Commit authoring must run only after the applicable review lenses pass with no blocking findings.
- Commit authoring is complete only after push succeeds and push evidence is recorded.
- `ready-for-closeout` is valid once commit authoring completes with commit SHA(s) and push-success evidence; PR authoring is never required for closeout.
- PR authoring must run only on an explicit, separate PR request, and only after commit authoring is complete and commit SHAs are recorded; it must never be dispatched automatically after commit-and-push.
- When explicitly requested, PR authoring is complete only after live PR creation succeeds and PR URL/number evidence is recorded.
- If push fails, workflow must route `blocked` or `awaiting-approval` (never `ready-for-closeout`). If an explicitly requested PR creation fails, route that request `blocked` or `awaiting-approval` without reopening an already closeout-ready workflow.
- Closeout is incomplete until `.agent-workflows/<workflow_id>/` is deleted and cleanup status is confirmed.
