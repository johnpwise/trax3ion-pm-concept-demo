# Bug Sweep Prompt

Review this React frontend codebase as a senior frontend engineer doing a bug hunt and architecture review.

Your job is to inspect the project and produce a practical audit, not a rewrite.

## Focus Areas

- runtime bugs and likely failure points
- incorrect async handling, stale closures, race conditions, effect dependency mistakes, memory leaks, and state synchronization issues
- React-specific problems such as unnecessary re-renders, unstable keys, broken memoization, derived state mistakes, prop drilling, context misuse, and component lifecycle bugs
- form and UI state issues such as uncontrolled/controlled input bugs, validation gaps, optimistic update failures, loading/error/empty state handling, and inconsistent UX behavior
- TypeScript issues such as unsafe casts, weak type boundaries, missing null handling, incorrect generics, and places where the types hide real bugs
- API integration problems such as inconsistent server-state handling, bad caching assumptions, duplicate fetching, weak error handling, contract mismatches, and retry or invalidation issues
- architectural issues such as tight coupling, poor separation of concerns, god components, duplicated business logic, weak boundaries between components, hooks, services, and utilities, and over-complex abstractions
- maintainability issues such as dead code, inconsistent patterns, poor folder structure, unclear ownership of state, weak reusability, and poor testability
- accessibility issues such as missing semantics, keyboard traps, labeling issues, focus-management bugs, and screen-reader problems
- performance issues only where they are concrete and evidence-based, not speculative micro-optimizations

Project assumptions:

- React 19+
- functional components and hooks
- strict TypeScript
- prefer local component state by default
- call out legacy or risky patterns explicitly
- do not recommend Redux unless the codebase already depends on it or it is clearly justified

Please do not give generic advice. Only report issues you can justify from the codebase.

## Per-Issue Requirements

For each issue you find, provide:

- a short title
- severity: critical, high, medium, or low
- the file(s) and component(s) or hook(s) involved
- why it is a problem
- the likely user or production impact
- a concrete recommendation
- a minimal example patch or pseudocode fix when appropriate

## Required Output Format

- Executive summary
- top 5 risks
- overall architecture assessment
- Confirmed bugs and high-confidence defects
- Architectural and design issues
- Type safety issues
- Accessibility concerns
- Performance concerns
- Test coverage gaps
- Quick wins
- Questions / uncertainties where the code suggests a problem but evidence is incomplete

## Important Review Rules

- Be skeptical and specific
- Distinguish clearly between confirmed issues and suspected issues
- Prefer high-signal findings over long lists of style comments
- Do not praise the codebase unless it is directly relevant
- Do not rewrite entire modules unless necessary
- Flag missing context explicitly instead of guessing
- Prioritize issues that would matter in production
- If useful, infer the intended architecture and point out where the implementation violates it

When reviewing, pay special attention to:

- component responsibility and size
- hook design and hidden side effects
- state ownership and synchronization
- data-fetching patterns
- error/loading/empty states
- accessibility and keyboard behavior
- testability of non-trivial logic

## More Aggressive Variant

```text
Treat this as a production-readiness review for a React frontend that may already have hidden bugs. Inspect the codebase end-to-end and identify concrete defects, architectural weaknesses, accessibility issues, type-safety risks, and performance problems with evidence tied to files, components, and hooks. Separate confirmed bugs from suspected issues. Prioritize user impact and maintainability, not style.
```

## Stack-Aware Add-On

```text
Pay special attention to the conventions and failure modes of the libraries actually used in this repository, such as React Router, TanStack Query, Zustand, Formik, React Hook Form, Zod, SCSS modules, Jest, React Testing Library, Cypress, Vite, or Next.js.
```
