# Development guidelines

Rules the plans and the code must follow. `/flow:dev` passes this file to every plan, review and execution. Keep it short and checkable: a rule nobody can verify isn't a rule.

## References

- `CLAUDE.md`: engineering constraints of this repo. `DESIGN.md` for UI, `PRODUCT.md` for product questions.
- `datocms:datocms-cli`: CLI, migrations, environments, schema inspection and codegen.
- `datocms:datocms-content-modeling`: schema decisions.
- `datocms:datocms-cda`: queries, localization, cache tags, type generation.
- `datocms:datocms-frontend-integrations`: draft mode, Content Link, official components.
- `datocms:datocms-structured-text`: Structured Text rendering.

## Tests

Level: none
Sensitive areas:

No test runner is configured in this repo.

## Gate

Prettier runs on `cma-types.ts` before the diff because the generator's output differs from the formatted, committed file.

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run codegen && npx prettier --write src/lib/datocms/cma-types.ts && git diff --exit-code schema.graphql src/lib/datocms/graphql-env.d.ts src/lib/datocms/cma-types.ts
```
