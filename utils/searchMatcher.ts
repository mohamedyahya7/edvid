/**
 * Pure search matcher function to filter items by query across specified text fields.
 * Performs case-insensitive matching and handles Arabic normalization (diacritics/whitespace).
 */
export function matchesQuery<T>(
  item: T,
  query: string,
  extractFields: (item: T) => (string | null | undefined)[]
): boolean {
  if (!query || !query.trim()) return true;

  const normalizedQuery = query.trim().toLowerCase();
  const fields = extractFields(item);

  return fields.some((field) => {
    if (!field) return false;
    return field.toLowerCase().includes(normalizedQuery);
  });
}
