---
kind: decision
status: active
superseded_by: null
work: native-ui-messages
area: i18n
touches: [src/i18n/request.ts, src/messages]
description: 'UI labels live in nested JSON in src/messages (en, it) read by next-intl, keys typed via AppConfig; the DatoCMS Translation model is removed. No YAML.'
---

# UI labels live in nested JSON files in the repo

**Date**: 2026-11-08

## The decision

UI labels live in nested JSON files in the repo (src/messages/en.json and it.json), read by next-intl, with keys typed through AppConfig. The DatoCMS Translation model is removed.

## Context

UI labels were 134 key-value records of the DatoCMS Translation model, fetched at request time. The owner found the CMS management neither useful nor efficient, and asked for a native key-value nested format, open between YAML and whatever Next uses.

## Alternatives discarded

- **Keep the labels on DatoCMS**: editing without a deploy was not worth a query per locale, the dependency on the webhook and cache, and keys that fail only at runtime.
- **YAML files**: next-intl has no native YAML support, so it would need a Turbopack loader or a runtime parser, and typed keys would need a generation step instead of typeof on the JSON import.

## Consequences

Every label change needs a commit and a deploy, and nobody can change a label from the CMS. JSON allows no comments. A key missing from one locale must be caught by the mutual type assertion between en.json and it.json.

## Reopen when

Non-developers need to change UI labels regularly without going through a deploy.

## References

- docs/work/archive/2026-11-08-native-ui-messages/slices.md

## Status log

- 2026-11-08 — recorded
