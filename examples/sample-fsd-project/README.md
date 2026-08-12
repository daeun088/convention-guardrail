# Sample FSD project

A minimal Feature-Sliced Design structure used to exercise the static
engine end-to-end.

- `src/entities/user/` — the `user` entity (lower layer)
- `src/features/edit-user/` — a feature that correctly imports from
  `entities/user` (allowed: lower layer)
- `src/entities/user/broken-import.ts` — **deliberate violation**: an
  `entities` file importing from `features` (a higher layer)

Run the CLI against it from the repo root:

```bash
pnpm build
node dist/cli/index.js check examples/sample-fsd-project/src --config guardrail.config.yaml
```

This should report exactly one `layer-direction` violation, on
`broken-import.ts`.
