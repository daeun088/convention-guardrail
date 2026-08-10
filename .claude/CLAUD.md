# CLAUDE.md

> Project context for Claude Code. Read this fully before making any change.

## What this is

`convention-guardrail` is an open-source tool that catches **architectural
convention violations at AI code-generation time** — not after the fact. It
hooks into the AI coding loop through an MCP (Model Context Protocol) server,
so when an AI assistant writes code, violations are surfaced (and optionally
corrected) as they happen.

## The core idea — the one thing that makes this NOT just a linter

Existing linters (ESLint, dependency-cruiser, eslint-plugin-boundaries) check
code **after a human writes it**, and only enforce **explicitly codified rules**.
Two gaps this project fills:

1. **Timing (primary differentiator).** We intervene _inside the AI generation
   loop_ via MCP, not in a post-hoc CI/lint step. Static analysis is the
   _means_; generation-time intervention is the _point_. Never frame this
   project as "a better linter" — frame it as "a guardrail that acts while AI
   writes code."
2. **Judgment-type conventions.** Teams hold implicit architectural rules that
   were never codified ("this logic belongs in a different layer", "this name
   doesn't match its domain role"). Deterministic tools can't catch these — a
   thin LLM layer handles exactly this class of rule.

Origin: analysis of a enterprise AI-code-generation pilot found that
tool-enforced conventions were reliably followed by AI output, while
judgment-based architectural conventions were repeatedly missed. This tool
closes that gap.

### In scope

- **Target architecture: Feature-Sliced Design (FSD) only.** Design the
  interfaces so other architectures _could_ plug in later, but do not build
  them.
- **Static detection engine (the CORE — build first):**
  - Layer import-direction rule (a layer may only import from lower layers:
    `app → pages → widgets → features → entities → shared`)
  - Same-layer cross-import rule (slice A must not directly import slice B on
    the same layer)
  - Public-API rule (a slice must be imported via its `index` barrel, not its
    internals)
- **LLM judgment engine (thin — build second):**
  - Flagship rule: _slice placement_ — "is this logic in the correct FSD
    layer?" (genuine judgment, not codifiable as an AST rule)
  - Provider-swappable: Anthropic API (bring-your-own-key) AND a local Ollama
    option, so the tool stays usable with no paid API (OSS purity — this
    matters for judging).
- **MCP server** exposing the engines as tools an AI coding assistant calls
  during generation.
- **CLI** (`guardrail check <path>`) as the standalone / fallback entry point.
- **Demo sample repo** with seeded violations, plus a small evaluation
  measuring AI convention-compliance rate (structural vs judgment) to back the
  origin claim with numbers.

### Out of scope — do NOT build

- Other architectures (MVC, hexagonal, etc.) — interface only
- Editor/IDE plugins (VS Code extension, etc.)
- Web UI or dashboard
- Silent auto-fixing of violations without user confirmation
- Languages other than TypeScript/JavaScript
- Config GUIs, telemetry, plugin marketplaces

If a change isn't on the in-scope list, don't build it — record it under
"future roadmap" in the report instead.

## Architecture

Key design decision: **detection and judgment share one common engine
interface**, so the static engine and the LLM engine are interchangeable and
composable. We fully build the static engine now and skeleton the LLM engine —
but the seams exist from day one.

```
convention-guardrail/
├── README.md                    # English main + short Korean summary
├── LICENSE                      # MIT
├── package.json
├── tsconfig.json
├── guardrail.config.yaml        # user-editable rule definitions
├── src/
│   ├── core/                    # engine-agnostic types & utils
│   │   ├── types.ts             # Rule, Violation, CheckResult, EngineInterface
│   │   └── config.ts            # config loader + validation
│   ├── engines/
│   │   ├── engine.interface.ts  # every engine implements this
│   │   ├── static/              # deterministic engine (CORE)
│   │   │   ├── index.ts
│   │   │   └── rules/           # one file per rule, independently testable
│   │   └── llm/                 # judgment engine (skeleton now)
│   │       ├── index.ts
│   │       └── providers/       # provider-swappable
│   │           ├── provider.interface.ts
│   │           ├── anthropic.ts
│   │           └── ollama.ts    # local open model → OSS purity
│   ├── mcp/                     # MCP server (phase 4)
│   │   └── server.ts
│   └── cli/
│       └── index.ts             # `guardrail check`
├── examples/
│   └── sample-fsd-project/      # seeded violations for demo + tests
└── docs/
    └── architecture.md
```

Data flow:

1. CLI or MCP server receives a set of changed files.
2. Config loader reads `guardrail.config.yaml`.
3. Each enabled engine runs `check(files, config) => Promise<Violation[]>`.
4. Static engine: deterministic AST checks via ts-morph.
5. LLM engine: sends targeted context to the configured provider, parses
   structured violations back.
6. Results are merged, deduped, and returned — CLI prints them; MCP hands them
   back to the AI assistant mid-generation.

## Tech stack

- TypeScript (strict), Node ≥ 18, ESM
- AST: `ts-morph`
- MCP: `@modelcontextprotocol/sdk`
- CLI: `commander`, output coloring via `picocolors`
- Config: `yaml`
- LLM: `@anthropic-ai/sdk` + local Ollama over `fetch`
- Tests: `vitest`
- Package manager: `pnpm`

## Conventions (dogfood our own values)

- Everything in English: code, comments, README, commit messages.
- Commit format: `feat(#issue-number): title` + body + footer — see
  `.claude/skills/project-rules/SKILL.md` for the full convention.
- Every engine implements `EngineInterface`; no engine-specific logic leaks into
  `core/` or `cli/`.
- Every provider implements `ProviderInterface`; adding a provider = one new
  file, zero changes elsewhere.
- Rules are small, pure, independently testable functions.
- No secrets in the repo; API keys via environment variables only.

## Roadmap (compact)

- **Phase 1** — repo scaffold + config schema + first static rule (vertical slice)
- **Phase 2** — complete static engine (all 3 rules) + CLI → _safe minimum
  submittable build_
- **Phase 3** — LLM judgment engine + provider abstraction
- **Phase 4** — MCP server wrapping the engines
- **Phase 5** — sample repo, evaluation, docs, demo video, report

**Risk rule:** the static core (Phase 2) must be finished and committable
_before_ starting Phase 3. Never let an unfinished LLM/MCP layer block a
working static build.
