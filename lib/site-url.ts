/**
 * Canonical site origin for `metadataBase`, Open Graph, sitemap, and `robots.txt`.
 * In production, set `NEXT_PUBLIC_APP_URL` to your public URL (e.g. `https://www.example.com`).
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return "http://localhost:3000";
}
