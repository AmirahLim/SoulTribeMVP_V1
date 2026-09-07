/** Stable app URL; never persist an expiring signed URL or expose the bucket. */
export function privateAvatarUrl(path: string): string {
  return '/api/avatar?path=' + encodeURIComponent(path);
}
export function validAvatarPath(path: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/avatar-[0-9a-f-]+\.jpg$/i.test(path);
}
