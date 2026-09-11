# state-ownership-policy.md

## Purpose

This document adds React-specific guidance on top of the canonical frontend policy in:

- `agents-core/agent-docs/standards/architecture/frontend-state-ownership-standards.md`

Use that core standard as the source of truth for the shared decision ladder and tier qualifier semantics.

## React-specific mapping

When applying `capability_owners.shared_client_state_owner`, always include:

- `capability_owners.shared_client_state_tier: subtree | cross_feature`

React-specific expectations:

- `subtree`: prefer context or lifted tree state when ownership naturally spans one feature subtree
- `cross_feature`: use broader store-based client state only for durable cross-page or cross-feature concerns

## Rules of thumb

Prefer local state when possible because:
- ownership is obvious
- testing is simpler
- coordination cost stays low

Avoid:
- multiple writable sources of truth
- copying fetched server data into client stores by habit
- globalizing modal, filter, or form state prematurely
- storing simple derivations that can drift from source data

Concrete package choices for these ownership capabilities belong in the repo-local overlay.
