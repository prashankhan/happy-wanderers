/**
 * Poster + reduced-motion fallback (`public/`).
 */
export const HOME_MARKETING_HERO_PATH = "/images/marketing/home-hero.jpg";

/** CTA band background (`public/images/marketing/…` — spaces URL-encoded). */
export const HOME_MARKETING_CTA_PATH =
  "/images/marketing/Reserve%20your%20rainforest%20day.jpeg";

/** Destination showcase column image (`public/images/marketing/…` — spaces URL-encoded). */
export const HOME_MARKETING_DESTINATION_SHOWCASE_PATH =
  "/images/marketing/North%20Queensland%2C%20told%20through%20the%20forest%20floor.jpeg";

/** Wet Tropics canopy / valley still — used on About pillar cards (`public/`). */
export const HOME_MARKETING_WET_TROPICS_VALLEY_PATH =
  "/images/marketing/North%20Queensland%2C%20told%20through%20the%20forest%20floor%20happy%20wanderers.jpeg";

/** About page — Field authority section background (`Field authority..jpeg` in `public/`). */
export const HOME_MARKETING_FIELD_AUTHORITY_SECTION_PATH =
  "/images/marketing/Field%20authority..jpeg";

/** About page — service area profile card (`Cairns, Port Douglas & the Daintree..jpeg` in `public/`). */
export const HOME_MARKETING_SERVICE_AREA_PATH =
  "/images/marketing/Cairns%2C%20Port%20Douglas%20%26%20the%20Daintree..jpeg";

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
