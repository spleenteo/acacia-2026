import { type Client } from 'datocms/lib/cma-client-node';

// Deletes the `translation` model by api_key (ids change across forks).
// Idempotent: does nothing when the model is already gone.
export default async function (client: Client): Promise<void> {
  const itemTypes = await client.itemTypes.list();
  const translation = itemTypes.find((it) => it.api_key === 'translation');
  if (!translation) return;

  await client.itemTypes.destroy(translation.id);
}
