# css-coding-standards.md

## Purpose

This document defines reusable CSS policy for frontend work generated under this stack pack.

Use this guidance for any CSS file in scope, including global styles (for example `src/index.css`), feature styles, and component-local styles where directives are used.

## Directive ordering contract

When a stylesheet uses Tailwind/PostCSS directives, enforce this exact top-level order:

1. all `@import` rules first
2. then `@source`
3. then `@plugin`
4. then `@custom-variant`

Rationale:
- PostCSS enforces `@import` precedence and requires imports before other statements.
- Preline + Vite/Tailwind integration should keep imports grouped first before source/plugin/custom variant directives.

## Additional rules

- keep directive ordering deterministic and consistent across files to avoid environment-dependent build behavior
- do not interleave non-directive selectors between these top-level directives
- when updating existing files, normalize directive order to this contract as part of the change
- preserve existing theme import paths and avoid undocumented path substitutions
