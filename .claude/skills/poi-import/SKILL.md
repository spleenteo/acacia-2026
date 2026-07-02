---
name: poi-import
description: "Import Points of Interest (POI) into DatoCMS from a photographed list image (HEIC/JPG) — the recurring 'GOURMET / HAPPY HOUR / ...' Florence lists with a coloured category header and numbered name + Instagram handle rows. Use whenever the user wants to import/ingest a POI list from an image, process one of the ~10 category lists, or 'reproduce the POI import'. Handles: OCR of the list, web research (description, address, coordinates, image, districts), image download+resize, and creation of draft POI records on the activities-01 environment. Triggers: a .heic/.jpg list image is provided, or the user says 'import this list', 'importa questa lista', 'poi import', 'carica i POI'."
---

# POI Import — from a list image to draft POI records

Reproduces the manual workflow used to import the "Gourmet" list: read a photographed
category list, research each place, download an image, and create draft POI records on
DatoCMS. Output is **drafts + a review report** — never publish automatically.

Read `references/schema.md` for the POI model fields, validators, and the exact
category / district names available.

## Environment

- Target the **DatoCMS environment in `.env.local` `DATOCMS_ENVIRONMENT`** (currently
  `activities-01`, a sandbox). All `cma:*` commands take `--environment=$DATOCMS_ENVIRONMENT`.
- The `poi` / `poi_category` models and the `poi.category` / `poi.related_content` fields
  live on that sandbox (added via CMA, not migrations yet). See [[poi-activities-01-staging]].
- Use the DatoCMS **CLI + skills**, never the MCP (project rule in CLAUDE.md).

## Workflow

### 1. Read the list image

- Convert to JPG if needed: `bash .claude/skills/poi-import/scripts/prepare-image.sh <input.heic> <scratchpad>/list.jpg`
- `Read` the JPG. Extract:
  - **Category** — the coloured header banner (e.g. `HAPPY HOUR`, `GOURMET`).
  - **Rows** — for each numbered pin: the **name** and the **Instagram handle** (the `@…`
    under the name). Some rows have no handle (leave it empty; try to recover it in research).

### 2. Map the category

Match the header to an existing `poi_category` **by name** (see `references/schema.md` —
e.g. `HAPPY HOUR` → `Happy Hours`, `GOURMET` → `Gourmet`). If there is no clear match,
stop and ask the user which category to use (do not invent one — the user may create it
and give you its **record id**). The `poi.category` field is a **multi-link**, so a POI can
have several categories, but the list header gives one.

### 3. Research every place (parallel subagents)

Split the rows into groups of ~4–5 and launch **general-purpose** subagents in parallel.
Each returns a JSON array; for every place research the web (official site, TheFork, Google
Maps, OpenStreetMap) and return FACTUAL, VERIFIED data — never invent:

- `instagram_verified`: the official handle **with `@`** (verify it resolves to a real
  profile); `null` if none. Note any mismatch vs the handle in the image.
- `description_en`: a VERY SHORT English description, **max 200 chars**, factual.
- `address`, `lat`, `lon`: coordinates only if reliable and **plausible for Florence**
  (lat ~43.75–43.80, lon ~11.20–11.30), else `null`.
- `districts`: **1–2 district names** (from the list in `references/schema.md`) the address
  falls in — a POI may belong to more than one. District records have **no coordinates**, so
  judge by address/zone.
- `night_day`: `day` / `night` / `anytime`, inferred from the venue type (a café → `day`,
  a cocktail/aperitivo bar → `night`, an all-day place → `anytime`). Best-effort; default
  `anytime` if unsure.
- `image_url`: a DIRECT link to ONE representative photo (venue/room/dish, **not a logo**)
  from the **official site** (og:image or a hero image). `null` if only a logo, a stock
  photo, or nothing usable. **Do NOT use Instagram** (login-gated) and do NOT use generic
  stock images.
- `confidence`, `notes`.

### 4. Choose the Instagram handle to store

Store the handle **from the image** (that is the user's source), with two exceptions:
normalise technically-invalid handles (accents → e.g. `@la_ménagére` → `@la_menagere`) and
fill in missing ones from research. Handle format validator is `^@\S+$` (must start with
`@`, no spaces). List every discrepancy vs the verified handle in the final report so the
user can fix it in one click.

### 5. Prepare the images

For each `image_url`, download + normalise to a JPG **≤ 1 MB** (the `featured_image` field
caps at 1 MB):
`bash .claude/skills/poi-import/scripts/fetch-resize.sh "<url>" <scratchpad>/img/<slug>.jpg`
Skip places with no usable image (report them).

### 6. Build the import JSON

Write `<scratchpad>/poi-input.json`:

```json
{
  "category": "Happy Hours",
  "pois": [
    {
      "name": "Rifrullo",
      "instagram": "@rifrullofirenze",
      "description": "…max 200 chars…",
      "night_day": "night",
      "lat": 43.76,
      "lon": 11.25,
      "districts": ["San Niccolò"],
      "imagePath": "<scratchpad>/img/rifrullo.jpg"
    }
  ]
}
```

Use `"category": "<name>"` to resolve the category by name, OR `"categoryId": "<record id>"`
to point at it directly (preferred when the name has special characters like `&`, or the
category was just created). Omit `imagePath` when there is no image; omit `lat`/`lon` when
not reliable; `districts` may hold 1–2 names (matched by name or slug at runtime).

### 7. Create the draft records

```bash
POI_IMPORT_JSON=<scratchpad>/poi-input.json \
  npx datocms cma:script .claude/skills/poi-import/scripts/import-pois.ts \
  --environment="$DATOCMS_ENVIRONMENT"
```

The script resolves the `poi` model, the category, and the districts **by name at runtime**
(so it keeps working if the models are promoted to another environment), creates each record
as a **draft**, uploads the image into `featured_image`, and prints a JSON result.

### 8. Report for review

Produce a table of what was created plus the **uncertainties to review**:
Instagram-handle discrepancies (image vs verified), low-confidence district assignments,
missing/stock images, and the category used. The user reviews the drafts in DatoCMS and
publishes.

## Gotchas (learned the hard way)

- **Never publish automatically** — data has uncertain parts (handles, districts, images).
- **`related_content` has `delete_references` on unpublish**: updating/republishing a POI
  that is already referenced by a mood can drop it from that mood. Set relations once, at
  creation, and avoid needless re-publish cycles.
- **Coordinates**: sanity-check they fall inside Florence bounds; a wrong lat/lon puts the
  pin in the wrong place. Prefer `null` over a guess.
- **Images**: official sites only; no Instagram, no generic stock; always ≤ 1 MB.
- **Duplicates across lists**: a place may already exist under another category. The
  import script **upserts by `name`** — if a POI with that name exists it just ADDS the
  new category (multi-link) and leaves the rest untouched; otherwise it creates. So for a
  known duplicate you can pass just `{ "name": "..." }` (no research needed). Match is
  case-insensitive; watch for accent/spelling variants (e.g. `La Ménagére` vs `La Ménagère`)
  — pass the EXISTING record's exact name so it matches.
- **Permanently closed venues**: if research shows a place is closed for good, don't create
  it — flag it in the report and let the user decide.
