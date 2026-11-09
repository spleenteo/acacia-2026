# Changelog

Each entry records what changed for the product and why, newest first.

## v1.4.1 — 2026-11-09 — Interface labels now come from the repo

The interface labels (menus, buttons, messages) used to be loaded from the DatoCMS Translation model at request time. They now live in typed JSON files in the repo, so a label change ships with the code and no longer depends on a CMS fetch.

- **Labels in the repo**: English and Italian labels are nested JSON files in `src/messages`, read by next-intl, with keys typed so a missing or misspelled key fails at build time.
- **Translation model removed**: the DatoCMS Translation model is deleted, and the runtime fetch of its records is gone.
- **Tooling cleanup**: the translation export script and its docs are removed, and the schema and generated types are regenerated without the model.
- **Work**: `native-ui-messages`
- **Decision**: [UI labels live in nested JSON files in the repo](decisions-log/2026-11-08-ui-labels-in-repo-json.md)

---
