---
name: create-issue
description: This skill should be used when the user asks to "create an issue", "file a bug", "open a GitHub issue", or wants to track a task/bug/feature in convention-guardrail's issue tracker. Uses `gh issue create`.
version: 0.1.0
---

# Create Issue

Creates a GitHub issue on `daeun088/convention-guardrail` via the `gh` CLI.

## Workflow

1. **Gather the essentials** before creating anything:
   - What kind of issue: `feat`, `fix`, `docs`, `refactor`, `test`, or `chore`
     (mirrors the commit-convention types — see `project-rules` skill).
   - A short, clear title.
   - Enough body detail to be actionable later without re-reading the whole
     conversation.
   - Do not guess scope — if the request is ambiguous, ask rather than filing
     a vague issue.

2. **Title format**: prefix with the type in brackets, matching the commit
   convention's types (see `project-rules` skill) — `[Feat]`, `[Fix]`,
   `[Docs]`, `[Refactor]`, `[Test]`, `[Chore]`. The two existing templates use
   `[Bug]` (maps to `fix`) and `[Feature]` (maps to `feat`) — keep those exact
   labels when the corresponding template is used; use the commit-type
   brackets for anything else, e.g. `[Chore] Add CI workflow`. Keep the rest
   short and specific, e.g. `[Feature] Add same-layer cross-import rule`, not
   "Fix stuff".

3. **Body template**:

   ```markdown
   ## Summary
   <1-2 sentences on what's needed and why>

   ## Scope
   - [ ] <concrete sub-task>
   - [ ] <concrete sub-task>

   ## Notes
   <any relevant context, links, or constraints — e.g. which roadmap phase
   this belongs to per .claude/CLAUD.md>
   ```

   Keep it lean — don't pad with sections that have nothing to say.

4. **Create it** — always pass `--label` mapped from the issue type, so
   nothing relies on remembering to add it later:

   | type       | label           |
   |------------|-----------------|
   | `feat`     | `enhancement`   |
   | `fix`      | `bug`           |
   | `docs`     | `documentation` |
   | `refactor` | `refactor`      |
   | `test`     | `test`          |
   | `chore`    | `chore`         |

   ```bash
   gh issue create --repo daeun088/convention-guardrail \
     --title "<title>" \
     --label "<mapped-label>" \
     --body "$(cat <<'EOF'
   <body>
   EOF
   )"
   ```

   If a label doesn't exist yet, create it first with `gh label create` (check
   `gh label list --repo daeun088/convention-guardrail`) rather than skipping
   it.

   If the issue maps to one of the roadmap phases in `.claude/CLAUD.md`
   (Phase 1–5), also pass `--milestone "Phase N — ..."` (check
   `gh api repos/daeun088/convention-guardrail/milestones` for exact titles).
   Repo-hygiene / meta issues that don't fit a phase can skip this.

5. **Report back**: give the user the issue number and URL returned by `gh`.
   The issue number is what gets referenced in commits per the
   `feat(#issue-number): title` convention (see `project-rules` skill) — so
   surface it clearly once created.

## Guardrails

- Never create an issue silently as a side effect of other work — issue
  creation is visible to anyone watching the repo, so confirm the
  title/body with the user first unless they've already given explicit
  content to use verbatim.
- Don't auto-assign, auto-label, or auto-close issues unless asked.
