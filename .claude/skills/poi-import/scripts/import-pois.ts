/**
 * Create draft POI records from a JSON input file. Resolves the poi model, the
 * poi_category and the districts BY NAME at runtime (so it survives environment
 * promotion). Run via cma:script file-mode:
 *
 *   POI_IMPORT_JSON=/path/to/poi-input.json \
 *     npx datocms cma:script .claude/skills/poi-import/scripts/import-pois.ts \
 *     --environment="$DATOCMS_ENVIRONMENT"
 *
 * Input shape — see SKILL.md step 6.
 */
import type { Client } from 'datocms/lib/cma-client-node';
import { readFileSync } from 'fs';

type PoiInput = {
  name: string;
  instagram?: string | null;
  description?: string | null;
  night_day?: 'anytime' | 'day' | 'night';
  lat?: number | null;
  lon?: number | null;
  districts?: string[]; // district names or slugs (1–2)
  imagePath?: string | null;
};
type ImportInput = {
  /** poi_category name to resolve (case-insensitive). */
  category?: string;
  /** Or the poi_category record id directly (wins over `category`, avoids name-matching). */
  categoryId?: string;
  pois: PoiInput[];
};

/** A CMS field value that is either a plain string or a localized object. */
type Loc = string | { en?: string | null } | null | undefined;
const enString = (v: Loc): string | undefined => (typeof v === 'string' ? v : (v?.en ?? undefined));

type Result = {
  name: string;
  ok: boolean;
  id?: string;
  error?: string;
  districts?: number;
  image?: boolean;
  unmatchedDistricts?: string[];
  /** 'created' | 'category-added' | 'already-in-category' — set for upsert clarity. */
  action?: string;
};

export default async function (client: Client): Promise<void> {
  const inputPath = process.env.POI_IMPORT_JSON;
  if (!inputPath) throw new Error('Set POI_IMPORT_JSON=/path/to/poi-input.json');
  const input = JSON.parse(readFileSync(inputPath, 'utf8')) as ImportInput;

  const itemTypes = await client.itemTypes.list();
  const poiType = itemTypes.find((t) => t.api_key === 'poi');
  if (!poiType) throw new Error('poi model not found in this environment');

  const categories = await client.items.list({
    filter: { type: 'poi_category' },
    page: { limit: 100 },
  });
  let catId: string | undefined;
  if (input.categoryId) {
    catId = categories.find((c) => c.id === input.categoryId)?.id;
    if (!catId) throw new Error(`poi_category id "${input.categoryId}" not found`);
  } else if (input.category) {
    catId = categories.find(
      (c) => enString(c.name as Loc)?.toLowerCase() === input.category?.toLowerCase(),
    )?.id;
    if (!catId) throw new Error(`poi_category "${input.category}" not found`);
  } else {
    throw new Error('Provide either "category" (name) or "categoryId" in the input');
  }

  const districts = await client.items.list({ filter: { type: 'district' }, page: { limit: 100 } });
  const districtId = (nameOrSlug: string): string | undefined => {
    const key = nameOrSlug.toLowerCase();
    return districts.find(
      (d) =>
        enString(d.name as Loc)?.toLowerCase() === key ||
        enString(d.slug as Loc)?.toLowerCase() === key,
    )?.id;
  };

  // Existing POIs by name — a list may repeat a place already imported under
  // another category; then we only ADD this category to it (name is unique, so a
  // create would fail). Match is case-insensitive on the (non-localized) name.
  const existingPois = await client.items.list({ filter: { type: 'poi' }, page: { limit: 500 } });
  const existingByName = new Map<string, { id: string; category: string[] }>();
  for (const ex of existingPois) {
    const nm = enString(ex.name as Loc)?.toLowerCase();
    if (nm) existingByName.set(nm, { id: ex.id, category: (ex.category as string[]) ?? [] });
  }

  const results: Result[] = [];
  for (const p of input.pois) {
    try {
      // Duplicate → just append the category to the existing record.
      const existing = existingByName.get(p.name.toLowerCase());
      if (existing) {
        if (existing.category.includes(catId)) {
          results.push({ name: p.name, id: existing.id, ok: true, action: 'already-in-category' });
        } else {
          await client.items.update(existing.id, { category: [...existing.category, catId] });
          results.push({ name: p.name, id: existing.id, ok: true, action: 'category-added' });
        }
        continue;
      }

      const distIds = (p.districts ?? []).map(districtId).filter((x): x is string => Boolean(x));
      const unmatched = (p.districts ?? []).filter((d) => !districtId(d));

      let uploadId: string | undefined;
      if (p.imagePath) {
        const upload = await client.uploads.createFromLocalFile({ localPath: p.imagePath });
        uploadId = upload.id;
      }

      const rec = await client.items.create({
        item_type: { type: 'item_type', id: poiType.id },
        name: p.name,
        night_day: p.night_day ?? 'anytime',
        description: (p.description ?? '').slice(0, 200),
        category: [catId],
        ...(p.instagram ? { instagram: p.instagram } : {}),
        ...(p.lat != null && p.lon != null
          ? { location: { latitude: p.lat, longitude: p.lon } }
          : {}),
        ...(distIds.length ? { related_content: distIds } : {}),
        ...(uploadId
          ? { featured_image: { upload_id: uploadId, alt: p.name, title: p.name } }
          : {}),
      });

      results.push({
        name: p.name,
        id: rec.id,
        ok: true,
        action: 'created',
        districts: distIds.length,
        image: Boolean(uploadId),
        ...(unmatched.length ? { unmatchedDistricts: unmatched } : {}),
      });
    } catch (e) {
      results.push({ name: p.name, ok: false, error: e instanceof Error ? e.message : String(e) });
    }
  }
  console.log(JSON.stringify(results, null, 2));
}
