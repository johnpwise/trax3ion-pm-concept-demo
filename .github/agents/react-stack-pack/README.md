# React Stack Pack

This stack pack is the first-pass React layer intended to sit on top of the shared core agent pack.

## Intended layering

`agents-core` → `agents-react` → repo-local overlay

The shared core pack owns:
- the Delivery Engineer, Architecture Advisor, and Independent Reviewer agents
- the inline delivery skills (feature-planning, tdd-slice, review-change, dependency-assessment, commit-and-push, create-develop-pr)
- execution-profile routing and the Delegation Gate
- generic handoff docs and workflow templates

This React pack adds React-specific review-lens content, stack policies, and frontend-focused guidance (no agent files — every stack specialist is an inline lens of the core `skills/review-change/`) that can be reused across React repositories.

## Included in this pack

### Agents

This pack ships no agent files. React-specific review, accessibility review, state-ownership
review, component-composition review, and API contract modelling are all inline lenses of the core
`skills/review-change/` skill
(`references/{correctness,accessibility,react-composition,state-ownership,api-contracts}.md`). An
`independent` review dispatch uses the core `independent-reviewer.agent.md`.

### Docs
- `routing/model-routing-policy.md`
- `standards/coding/react-file-coding-standards.md`
- `standards/coding/css-coding-standards.md`
- `standards/coding/component-test-file-coding-standards.md`
- `standards/coding/unit-test-file-coding-standards.md`
- `standards/coding/cypress-test-file-coding-standards.md`
- `standards/testing/frontend-testing-standards.md`
- `standards/architecture/frontend-state-ownership-standards.md`
- `standards/reliability/frontend-styling-and-accessibility-standards.md`
- `checklists/pr-ready-checklist.md`
- `workflows/feature-workflow-routing.md`
- `workflows/bug-workflow-routing.md`
- `prompts/react-feature-intake.prompt.md`
- `prompts/react-bug-intake.prompt.md`
- `prompts/bug-sweep.prompt.md`
- `prompts/delivery-engineer-auto-loop.prompt.md`

## Usage

1. Pull in the shared core pack first.
2. Add this pack alongside it.
3. Keep repo facts and exceptions in the local repo `AGENTS.md`.
4. In the local repo `AGENTS.md`, map `capability_owners` keys (`local_ui_state_owner`, `shared_client_state_owner`, `server_state_owner`), include `capability_owners.shared_client_state_tier` (`subtree` | `cross_feature`) when shared client ownership is used in new/updated frontend slices, and map `test_layer_matrix` execution to concrete packages/tooling used by that repo.
5. Record each step per the core `handoff-template.md` (compact Step Record; full Cross-Context Handoff Package only for a separate agent context).
6. Keep default handoff reentry to `delivery-engineer.agent.md`; one primary context owns the slice; re-enter `delivery-engineer` explicitly only for `blocked`/`awaiting-approval`/`ready-for-closeout`.
7. Apply `skills/review-change/` — the correctness lens on every code change, other lenses diff-classified (see feature-/bug-workflow-routing.md).
8. Override or supplement any policy only where the repo has a clear reason to diverge.
9. Persist workflow artifacts in `.agent-workflows/<workflow_id>/` and resolve fresh-context prompt files via `.agent-workflows/<workflow_id>/index.md`.
10. After workflow status is `closed`, delete `.agent-workflows/<workflow_id>/` to prevent artifact buildup.

## Adoption notes

When downstream repos upgrade frontend feature/bug workflow behavior, copy these stack-pack files together:

- breaking change: feature workflow entry now requires a leading `New Feature` trigger
- breaking change: bug workflow entry now requires a leading `Bug Fix` trigger
- feature routing now includes explicit `trivial` vs `non-trivial` path selection with strict gate-preserving fast-path criteria
- workflow routing now uses file-first prompt/handoff artifacts with required closeout cleanup

Copy these files together:

- `agent-docs/workflows/bug-workflow-routing.md`
- `agent-docs/workflows/feature-workflow-routing.md`
- `agent-docs/prompts/react-bug-intake.prompt.md`
- `agent-docs/prompts/react-feature-intake.prompt.md`
- `agent-docs/prompts/bug-sweep.prompt.md`
- `agent-docs/prompts/delivery-engineer-auto-loop.prompt.md`
- `agent-docs/standards/coding/css-coding-standards.md`
- `agent-docs/standards/coding/component-test-file-coding-standards.md`
- `agent-docs/standards/coding/unit-test-file-coding-standards.md`
- `agent-docs/standards/coding/cypress-test-file-coding-standards.md`
- `agent-docs/checklists/pr-ready-checklist.md`
- `AGENTS.md`

## Design notes

This first pass is intentionally conservative:
- it preserves delivery-engineer ownership for intake/reentry/closeout while keeping one primary context per slice, delegating only when the Delegation Gate is met
- it keeps stack rules out of the generic core pack
- it avoids locking into one exact project shape
- it favors reusable review and boundary guidance over repo-specific implementation detail
