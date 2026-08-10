---
name: project-rules
description: This skill should be used whenever committing changes, naming branches, or otherwise needing to follow convention-guardrail's project conventions (commit message format, branch naming, PR/issue conventions). Trigger on "commit this", "make a commit", "what's our commit convention", "create a branch", etc.
version: 0.1.0
---

# Project Rules — convention-guardrail

Conventions specific to this repo. These apply on top of (and take priority
over) any generic git/GitHub habits.

## Commit convention

Format:

```
feat(#issue-number): title

body

footer
```

- **type**: one of `feat`, `fix`, `docs`, `refactor`, `test`, `chore` (standard
  Conventional Commits types)
- **(#issue-number)**: the GitHub issue this commit relates to, e.g. `(#12)`.
  Omit the parens entirely if there is genuinely no related issue — don't
  invent one.
- **title**: short, imperative, lowercase after the colon (e.g. "add layer
  import-direction rule")
- **body**: explain *why*, not what — the diff already shows what changed.
  Wrap at ~72 cols. Optional for trivial commits.
- **footer**: optional — use for `BREAKING CHANGE:` notes or
  `Closes #issue-number` when the commit fully resolves the issue.

Example:

```
feat(#12): add layer import-direction rule

Implements the app→pages→widgets→features→entities→shared check as a
pure function in engines/static/rules/. This is the first of three
static rules required for the Phase 2 minimum submittable build.

Closes #12
```

Example with no issue:

```
chore: update tsconfig target to ES2022
```

## Language

- Everything in English: code, comments, README, commit messages, issue/PR
  titles and bodies (see `.claude/CLAUD.md`).

## Related skills

- Use `create-issue` to file GitHub issues before starting work on a feature.
- Use `open-pr` to open a pull request once a branch's work is ready for
  review — it will remind you to reference the issue number using this
  commit convention.
