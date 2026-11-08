# Slice packet

Repo: /Users/spleenteo/Sites/dsm/acacia-2026, branch work/native-ui-messages. Work dir: /Users/spleenteo/Sites/dsm/acacia-2026/docs/work/2026-11-08-native-ui-messages. Work without a frame: no criterion.

## Slice section (slices.md)

## V1 — Le label vengono dai file del repo

**Dentro**

- Creazione di `src/messages/`: oggi non esiste e `export-translations` fallisce con ENOENT.
- `src/messages/en.json` e `src/messages/it.json`, annidati, generati una volta dai record pubblicati con `npm run export-translations` lanciato esplicitamente su `activities-01` (il primary), e da lì in poi mantenuti a mano.
- `src/i18n/request.ts` carica il JSON della lingua richiesta al posto di `fetchTranslations`.
- Chiavi tipizzate con l'`AppConfig` di next-intl (`Messages: typeof en`).
- Asserzione di tipo reciproca tra `en.json` e `it.json`, così una chiave presente in una sola lingua fa fallire `tsc`.
- Le due mappe di chiavi calcolate, `src/lib/search/searchType.ts` e `src/components/FilterBar/masonryFilters.ts`, tipizzate con `as const satisfies`, senza cast su `t`.
- Rimozione di `src/lib/datocms/fetchTranslations.ts` e dell'opzione `noStore` di `executeQuery`, che resta senza chiamanti.
- Documenti che diventano falsi: `CLAUDE.md` righe 34 (i JSON ora si committano) e 76-79 (fonte di verità e come aggiungere una stringa), `PRODUCT.md:27`, il commento in `ApartmentDetailContent.tsx:180`, e `docs/pre-launch-review.md` righe 17, 25, 50, 101, 120, 121.

**Fuori**

- Modello `Translation` su DatoCMS e script `export-translations`: tutto in V2.
- Riscrittura o riorganizzazione delle chiavi e dei testi. Restano anche le 17 chiavi inutilizzate e le 20 con italiano uguale all'inglese: possibile work successivo.
- Tipizzazione dei parametri ICU.

**Done**

- Gate verde.
- `en.json` e `it.json` hanno lo stesso insieme di chiavi, in numero pari ai record pubblicati al momento del dump, e i valori coincidono con quei record, a chiavi ordinate.
- Una chiave inesistente passata a `t()` fa fallire `npx tsc --noEmit`, e così una chiave presente in un solo JSON.
- In dev, in `/en` e `/it`, mostrano le stesse label di prima: home, dettaglio appartamento, `/search` con i tipi di risultato, dettaglio mood e dettaglio quartiere con i filtri, `/guestbook`, e il `DraftModeToggler`.

**Attenzione**

- Il dump si rifà o si riconfronta subito prima del deploy di V1, altrimenti le modifiche fatte nel CMS nel frattempo vanno perse. Dopo il deploy non va più rilanciato: sovrascriverebbe i JSON modificati a mano.
- Dal deploy di V1 in poi il modello `Translation` resta modificabile ma non ha più effetto, senza alcun segnale: stop alle modifiche delle label sul CMS, e intervallo breve tra V1 e V2.
- `src/messages/*.json` oggi è descritto da `CLAUDE.md` come da non committare: in questo work diventa sorgente.

**Deviations found while planning V1**

- `CLAUDE.md:38` va corretta anche se non era nel mandato: cita `noStore: true`, che V1 rimuove.
- `docs/pre-launch-review.md:21` e il commento in `src/components/BookingModal/index.tsx:20` vanno corretti anche se non erano nel mandato: indicano ancora DatoCMS come destinazione del testo.

## Lessons

None yet (first slice).

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
