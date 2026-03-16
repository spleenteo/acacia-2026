import { icons, type LucideIcon } from 'lucide-react';

/**
 * Resolve a Lucide icon by name. Accepts both formats:
 * - kebab-case from Lucide URL: "air-vent", "washing-machine", "shower-head"
 * - PascalCase component name: "AirVent", "WashingMachine", "ShowerHead"
 *
 * Browse all available icons at: https://lucide.dev/icons/
 * Fallback: "Info" icon.
 */
function toPascalCase(str: string): string {
  return str
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

export function getAmenityIcon(name: string | null | undefined): LucideIcon {
  if (!name) return icons.Info;
  // Try as-is first (already PascalCase), then convert from kebab-case
  return (
    icons[name as keyof typeof icons] ??
    icons[toPascalCase(name) as keyof typeof icons] ??
    icons.Info
  );
}
