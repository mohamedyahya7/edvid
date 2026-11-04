/**
 * Converts bytes into human-readable string (e.g. 150 MB, 1.2 GB).
 */
export function formatBytes(bytes: number | null | undefined, decimals = 1): string {
  if (bytes == null || isNaN(bytes) || bytes <= 0) {
    return '0 MB';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['بايت', 'كيلوبايت', 'ميغابايت', 'غيغابايت', 'تيرابايت'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  if (i < 0) return '0 ميغابايت';

  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
  return `${value} ${sizes[i]}`;
}

export function formatBytesEn(bytes: number | null | undefined, decimals = 1): string {
  if (bytes == null || isNaN(bytes) || bytes <= 0) {
    return '0 MB';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  if (i < 0) return '0 MB';

  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
  return `${value} ${sizes[i]}`;
}
