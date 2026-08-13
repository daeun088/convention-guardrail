# Static rules

One file per rule. Each rule is a small, pure, independently testable
function that inspects resolved imports/AST and returns `Violation[]`.
`fsd-location.ts` is a shared helper (not a rule) that locates a file's
layer and slice from its path.

Implemented:

- `layer-direction.ts` — a layer may only import from lower layers
  (`app → pages → widgets → features → entities → shared`)
- `same-layer-cross-import.ts` — slice A must not directly import slice B on
  the same layer
- `public-api.ts` — cross-slice imports must use the target slice's `index`
  barrel; imports within the same slice may use internal modules

`same-layer-cross-import` and `public-api` skip any layer listed in config's
`sliceLessLayers` (e.g. `shared`), since the segment right under those
layers is a technical category (`ui`, `lib`, `api`), not a real slice
boundary — see `guardrail.config.yaml`.
