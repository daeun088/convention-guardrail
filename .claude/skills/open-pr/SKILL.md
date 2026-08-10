---
name: open-pr
description: This skill should be used when the user asks to "open a PR", "create a pull request", or wants to submit current branch work for review on convention-guardrail. Uses `gh pr create`.
version: 0.1.0
---

# Open PR

Opens a GitHub pull request on `daeun088/convention-guardrail` via the `gh`
CLI.

## Workflow

1. **Check state first** (run in parallel):
   - `git status` — uncommitted changes? Ask before including/excluding them.
   - `git log <base-branch>..HEAD` and `git diff <base-branch>...HEAD` — full
     set of commits going into the PR, not just the latest one.
   - Whether the branch is pushed / tracks a remote branch.

2. **Push the branch** if it isn't already on the remote:

   ```bash
   git push -u origin <branch-name>
   ```

   Confirm with the user before pushing if this is the first push of the
   branch — pushing is visible to others.

3. **Title**: short (<70 chars). If the work closes a specific issue, prefer
   matching the commit-convention style used in this repo, e.g.
   `feat(#12): add layer import-direction rule`, so PR title and commit
   history read consistently (see `project-rules` skill).

4. **Body template**:

   ```markdown
   ## Summary
   - <bullet on what changed>
   - <bullet on why>

   ## Test plan
   - [ ] <how this was verified — tests run, manual check, etc.>

   Closes #<issue-number>
   ```

   Only include `Closes #<issue-number>` if there's an actual linked issue —
   don't fabricate one.

5. **Create it**:

   ```bash
   gh pr create --repo daeun088/convention-guardrail \
     --title "<title>" \
     --body "$(cat <<'EOF'
   <body>
   EOF
   )"
   ```

   Use `--draft` if the user indicates the work isn't ready for review yet.

6. **Report back**: return the PR URL from `gh`'s output.

## Guardrails

- Never force-push, rebase, or squash to prep a branch for a PR without
  explicit confirmation.
- Don't open a PR against `main` from `main` — verify the feature branch is
  checked out first.
- Don't mark a PR ready-for-review or merge it as part of this skill —
  opening only.
