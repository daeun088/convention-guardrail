# Security Policy

## Reporting a Vulnerability

If you find a security vulnerability in `convention-guardrail`, please
report it privately using
[GitHub Security Advisories](https://github.com/daeun088/convention-guardrail/security/advisories/new)
rather than opening a public issue.

Please include:

- A description of the vulnerability and its potential impact
- Steps to reproduce (minimal repro if possible)
- Affected version/commit

We'll acknowledge reports as soon as possible and work with you on a fix
before any public disclosure.

## Scope

This project reads source code to check architectural conventions and,
when the LLM judgment engine is configured, sends targeted code snippets to
a user-configured provider (Anthropic API or local Ollama). Relevant
security concerns include:

- Handling of API keys (must stay in environment variables, never logged or
  committed — see `.claude/CLAUD.md`)
- Any code execution paths triggered by config or rule files
- Data sent to external LLM providers
