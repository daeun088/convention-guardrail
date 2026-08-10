# Contributing to convention-guardrail

Thanks for considering a contribution. This project enforces architectural
conventions (Feature-Sliced Design) at AI code-generation time — see
`.claude/CLAUD.md` for the full project context before making non-trivial
changes.

## Before you start

- For anything beyond a small fix, open an issue first (use the "Feature
  request" or "Bug report" template) so scope is agreed before code is
  written.
- Check `.claude/CLAUD.md`'s "In scope" / "Out of scope" sections — PRs for
  out-of-scope work will be redirected there.

## Local setup

```bash
pnpm install
pnpm test
pnpm lint
```

(Once the initial scaffold lands — see the project roadmap in
`.claude/CLAUD.md` — these commands will be wired up in `package.json`.)

## Commit convention

```
feat(#issue-number): title

body

footer
```

- Type: `feat`, `fix`, `docs`, `refactor`, `test`, or `chore`.
- `(#issue-number)`: the related GitHub issue. Omit the parens if there is
  genuinely no related issue.
- Body/footer are optional — see `.claude/skills/project-rules/SKILL.md` for
  full details and examples.

## Pull requests

- Branch from `develop`.
- One logical change per PR where reasonable.
- Fill out the PR template checklist — tests, `guardrail check` on
  `examples/sample-fsd-project`, docs updated if behavior changed.
- Reference the issue the PR addresses (`Closes #issue-number` in the PR
  body once it's fully resolved).

## Code conventions

- Everything in English: code, comments, docs, commit messages.
- Every engine implements `EngineInterface`; every LLM provider implements
  `ProviderInterface` — see `.claude/CLAUD.md` for the architecture.
- Rules are small, pure, independently testable functions.
- No secrets in the repo; API keys via environment variables only.

## Reporting bugs / security issues

- Bugs: open a GitHub issue using the "Bug report" template.
- Security vulnerabilities: see `SECURITY.md` — do not file a public issue.
