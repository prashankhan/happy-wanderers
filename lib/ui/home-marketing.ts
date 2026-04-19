/**
 * Poster + reduced-motion fallback (`public/`).
 */
export const HOME_MARKETING_HERO_PATH = "/images/marketing/home-hero.jpg";

/**
 * Looping hero background video (muted autoplay). Must be served from `public/` — same-origin only.
 *
 * **Why not a Pixabay “download” URL in the browser?** Those URLs are blocked for embedding (403 /
 * Cloudflare), so the `<video>` never loads and you only see the poster image.
 *
 * **What to do:** On Pixabay, use **Download** for your clip, then save the file as:
 * `public/videos/home-hero.mp4` (replace this file when you change the hero video).
 */
export const HOME_MARKETING_HERO_VIDEO_SRC = "/videos/home-hero.mp4";
