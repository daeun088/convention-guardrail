# Static rules

One file per rule. Each rule is a small, pure, independently testable
function that inspects resolved imports/AST and returns `Violation[]`.

Planned (see `.claude/CLAUD.md`):

- `layer-direction.ts` — a layer may only import from lower layers
  (`app → pages → widgets → features → entities → shared`)
- `same-layer-cross-import.ts` — slice A must not directly import slice B on
  the same layer
- `public-api.ts` — a slice must be imported via its `index` barrel, not its
  internals
