---
'@use-funnel/core': minor
---

feat(core): make `initial.context` optional when all context properties are optional

- `createFunnelSteps()` now defaults `TContext` to `{}` when no type argument is provided
- `useFunnel({ initial: { step: 'A' } })` is now valid when the context type has only optional properties (e.g. `{ foo?: string }` or `{}`)
