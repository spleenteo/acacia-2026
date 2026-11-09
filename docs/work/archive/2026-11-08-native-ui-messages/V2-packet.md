# Slice packet

Repo: /Users/spleenteo/Sites/dsm/acacia-2026, branch work/native-ui-messages. Work dir: /Users/spleenteo/Sites/dsm/acacia-2026/docs/work/2026-11-08-native-ui-messages. Work without a frame: no criterion. V1 is in production since 2026-11-08 (merge 817f48f).

## Slice section (slices.md)

## V2 — Il modello Translation sparisce da DatoCMS

**Precondizione**: V1 è in produzione. Fino ad allora il codice deployato interroga `allTranslations`.

**Dentro**

- Confronto tra CMS e JSON prima della promozione, per recuperare eventuali modifiche arrivate dopo il dump.
- Migration `datocms migrations:new` che cancella il modello `Translation`, eseguita su un environment sandbox forkato dal primary e poi promossa. Permesso di creare la sandbox dato dall'owner il 2026-11-08.
- `maintenance:on` dal fork alla promozione, con un ok dell'owner al momento di V2.
- `npm run codegen` e `npx tsc --noEmit` con `DATOCMS_ENVIRONMENT` sulla sandbox prima di promuovere; i file generati si committano prima del gate.
- Rimozione di `scripts/export-translations.ts`, del suo script in `package.json` e della sua citazione in `CLAUDE.md:34`.

**Fuori**

- Qualsiasi altro modello o campo DatoCMS.

**Done**

- Gate verde.
- `npx datocms schema:inspect` sul nuovo primary non elenca `Translation`.
- `rg -i 'allTranslations|fetchTranslations|export-translations' src scripts package.json CLAUDE.md` non trova nulla.
- Il sito di produzione mostra le label in entrambe le lingue dopo la promozione.

**Attenzione**

- Il webhook di invalidazione non scatta su una promozione: dopo serve l'invalidazione manuale. Non ha filtri per environment, quindi può scattare anche durante le operazioni in sandbox, senza danni: la cache si rigenera dal primary.
- `DATOCMS_ENVIRONMENT` su Vercel e in locale deve puntare al primary giusto dopo la promozione: se è valorizzato col vecchio nome, il sito legge l'environment sbagliato senza errori. Il valore su Vercel non è stato verificato.
- Esistono già 6 sandbox e il limite del piano non è leggibile: il fork potrebbe trovare un tetto.
- Cancellare il modello è irreversibile sul nuovo primary: il vecchio environment resta come copia finché l'owner non decide di rimuoverlo.
- Dopo V2, tornare a un deploy precedente a V1 richiede di ripromuovere il vecchio environment: quel codice interroga `allTranslations`.

**Deviations found while planning V2**

- `CLAUDE.md:76` va corretta anche se il mandato nomina solo la riga 34: descrive un modello che non esisterà più.
- `npx gql.tada generate output` si aggiunge a `npm run codegen`: senza, `graphql-env.d.ts` conserva `allTranslations` e il controllo del Done fallisce.

## Lessons

- Non far passare per `tail` un comando di verifica: l'exit code si perde. Redirigi su file o usa `set -o pipefail`.
- Su macOS `sed -i` vuole l'argomento del backup: controlla il diff prima del commit, così una cancellazione fallita non diventa un secondo commit.
- Prima di riscrivere la correzione di una voce di un documento di review, controlla che il codice abbia ancora quel problema.
- `prettier --check .` segnala anche file ignorati da git: distinguili dai file tracciati prima di dichiarare rosso il gate.

## Test level

none. No test runner in the repo.

## docs/development-guidelines.md (whole)

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

## Matching decisions

docs/decisions-log/2026-11-08-ui-labels-in-repo-json.md — UI labels live in nested JSON in src/messages (en, it) read by next-intl, keys typed via AppConfig; the DatoCMS Translation model is removed. No YAML.

## Project lenses

None: docs/impact-lenses.md is absent.

## Repo constraints for migrations

Never import from `../src/lib/cma-schema` in a migration. Scaffold imports are type-only where needed. Environments on DatoCMS are created only with the owner's permission, given for this one sandbox.

## Stack rules (flow:stack-datocms)

**CLI**

1. Work on the project through the DatoCMS CLI (`datocms`), linked once per repo (`datocms link`, which writes `datocms.config.json`), because schema, environments and migrations then run the same way for everyone and in CI.
2. Before planning a schema change, read the live schema with `datocms schema:inspect` instead of guessing it from the code, because the code shows only the fields it queries.
3. For API details and examples, use the DatoCMS skills when the session has them (References), else `datocms cma:docs` and the docs at datocms.com, never memory, because the API changes and remembered option names drift.

**Environments**

4. Change the schema in a sandbox, never by hand on the primary environment: `datocms migrations:run` forks the primary into a sandbox (`--destination`) and runs the pending migrations there; `datocms environments:promote` makes it primary once reviewed, because the primary serves production.
5. Run migrations in place on the primary (`--in-place --allow-primary`) only for strictly additive changes, because a run that fails halfway has no rollback.
6. Pass the environment to every client explicitly, from a variable the app reads, and keep production reads on the primary, because a sandbox returns different content without any error.
7. Keep the CMA token and the draft read token server-side and out of git, because one writes and the other reads unpublished content.

**Schema**

8. Every schema change is a migration script (`datocms migrations:new <name>`, or `--autogenerate=<sandbox>` to diff a sandbox built in the dashboard) committed with the code that uses it, because a migration is reviewable and replayable.
9. Query types come from the schema (`datocms schema:generate`, `gql.tada` or GraphQL Code Generator) and are checked in CI, because a field renamed in the CMS must fail the build, not the page.
10. Treat optional and localized fields as nullable in the code, because an untranslated or half-filled record returns `null`, not a fallback.

**Naming**

11. Name models for what they hold, not for how a page shows them, because the same content is reused by other pages and other apps.
12. Pages are regular models named `… Page` (`Home Page`, `Product Page`); reusable blocks are named `… Block` (`Text Block`, `Newsletter Signup Block`); the API key is the snake_case of the name (`newsletter_signup_block`) and matches the component's name in the code, because one name then finds the model, the block and its renderer.
13. Name fields by data type first (`slug`, `image`, `color`), then by function (`title`, `autoplay`), and by appearance only through `layout` and `style`, because names tied to a design break when the design changes.
14. Use the standard field names: `title` (not `heading`), `subtitle`, `slug` (built from `title`), `text` for structured text (not `body` or `content`), `blocks` for a modular content field, `items` for a list of the same block, `image` / `images`, `video`, `page` / `pages` for links to page models. A second field of the same type is named by its function (`background_image`). A boolean is named by its function (`autoplay`, `loop`), never by its look (`is_gray`), because a boolean means nothing without context.
15. Control appearance with two fields: `layout` (position, size, direction: `full-width`, `image-text`, `text-image`) and `style` (visual variant: `default`, `highlighted`), each a string with only allowed values, or `style` a link to a Style model when variants are shared across models, because a new variant is then a new value, not a new field or block.
