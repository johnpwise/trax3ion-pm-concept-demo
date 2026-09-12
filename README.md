# README.md

This project includes installed agent packs:

- `agents-core`: `.github/agents/agents-core`
- `react-stack-pack`: `.github/agents/react-stack-pack`

## Prompt paths

- Core prompts: `.github/agents/agents-core/agent-docs`
- React prompts: `.github/agents/react-stack-pack/agent-docs`
- Platform execution-profile mappings: `.github/agents/platforms/claude-code/execution-profile-mapping.md`, `.github/agents/platforms/codex/execution-profile-mapping.md`

## Trigger examples

Use agent spec: Delivery-Engineer
New Feature

Use agent spec: Delivery-Engineer
Bug Fix

IDE/copilot preamble text may appear before the trigger block; the first valid trigger block is authoritative.

## Working With Agents

Start here:

- [Delivery Engineer](./.github/agents/agents-core/agents/delivery-engineer.agent.md)
- [React Feature Workflow Routing](./.github/agents/react-stack-pack/agent-docs/workflows/feature-workflow-routing.md)
- [React Bug Workflow Routing](./.github/agents/react-stack-pack/agent-docs/workflows/bug-workflow-routing.md)

Workflow defaults:

- one primary context owns the slice; control returns to the workflow-owner role only for blocked/awaiting-approval/ready-for-closeout.
- Complexity is classified `trivial` vs `non-trivial` and delivery is sequenced into TDD increments inline.
- The `skills/review-change/` correctness lens is required before closeout; accessibility, composition, and state-ownership lenses are diff-classified.
- API contract modelling is a plan-time use of the `skills/review-change/` api-contracts lens.

## Workflow Prompts

Use agent spec: Delivery-Engineer
- `.github/agents/react-stack-pack/agent-docs/prompts/delivery-engineer-auto-loop.prompt.md`
