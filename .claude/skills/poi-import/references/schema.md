# POI model — fields, validators, and reference data

Environment: **activities-01** (sandbox). The script resolves ids by name at runtime, so the
ids below are informational (they may differ once promoted to another environment).

## `poi` model (`📍 POI`)

| Field (api_key)   | Type                        | Notes                                                                      |
| ----------------- | --------------------------- | -------------------------------------------------------------------------- |
| `name`            | string                      | **required + unique** (a duplicate create fails)                           |
| `instagram`       | string                      | validator `^@\S+$` — must start with `@`, no spaces. Optional              |
| `night_day`       | string radio                | **required**, one of `anytime` / `day` / `night` (default `anytime`)       |
| `description`     | string                      | optional; keep **≤ 200 chars**                                             |
| `featured_image`  | file                        | **max 1 MB**                                                               |
| `location`        | lat_lon                     | `{ latitude, longitude }`; optional                                        |
| `related_content` | links → `district` + `mood` | multi. Used here for **districts** (1–2). `delete_references` on unpublish |
| `category`        | links → `poi_category`      | **multi-link**; a POI can be in several categories                         |

CMA payload shapes: link/links fields take id strings (`category: [catId]`,
`related_content: [districtId, …]`); `location: { latitude, longitude }`;
`featured_image: { upload_id, alt, title }`. Create without `client.items.publish` → draft.

## `poi_category` records (match the image header by name)

| name (en)                 | id                     |
| ------------------------- | ---------------------- |
| Gourmet                   | DPEj4xU_SWSuy7VPmgIcJw |
| Happy Hours               | cvO_BQSeQu-Nbm6wMGsb8A |
| Supermarkets              | LnVwPC2VRhKyzWIf9OiSeg |
| Markets                   | TeHLxlnxTMG75k0kZ6nIdA |
| Services                  | Tr0CIt2UScC9SCFP2tEg9w |
| Point of Turist interest  | GgEO-qfATK29LllESkZMsA |
| Street Food & light lunch | aRypD2onQmKcuq1jbWs7Wg |
| Gardens                   | cXKpBPgxQP-6IwxoAGry2Q |

Header → category examples: `HAPPY HOUR` → `Happy Hours`, `GOURMET` → `Gourmet`,
`MERCATI` → `Markets`, `GIARDINI` → `Gardens`. If unsure, ask the user.

## `district` records (assign by address/zone — no coordinates in the CMS)

| name                | slug                        | id                     |
| ------------------- | --------------------------- | ---------------------- |
| Piazza Signoria     | piazza-signoria-in-florence | 20129                  |
| Santa Croce         | santa-croce                 | 17517                  |
| Sant'Ambrogio       | sant-ambrogio               | 21334                  |
| Santa Maria Novella | santa-maria-novella         | 18452                  |
| San Lorenzo         | san-lorenzo                 | 18453                  |
| Accademia           | san-marco                   | 23807                  |
| Duomo               | duomo-firenze               | 18450                  |
| Ponte Vecchio       | ponte-vecchio               | 18454                  |
| San Frediano        | san-frediano                | 23949                  |
| Santo Spirito       | santo-spirito               | 18449                  |
| Libertà             | liberta                     | EPyoGOBTQSyV4kjA4C72_Q |
| San Niccolò         | san-niccolo                 | 19864                  |
| Toscana             | toscana                     | 24040                  |

The import script matches districts by **name or slug** (case-insensitive), so pass either.
`Toscana` is the catch-all for places outside the historic centre.
