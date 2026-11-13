// Client- and edge-safe helpers and limits for delegate profile images.

export const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;

export const PROFILE_IMAGE_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

const TWICPICS_HOST_SUFFIX = ".twic.pics";

/**
 * For avatars hosted on TwicPics, append a cover transform sized for the
 * rendered avatar (2x for high-DPI screens). Any other URL is returned as-is.
 */
export function getTwicPicsAvatarUrl(
  url: string | null | undefined,
  size: number
): string | null {
  if (!url) {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  if (!parsed.hostname.endsWith(TWICPICS_HOST_SUFFIX)) {
    return url;
  }

  const pixels = Math.max(1, Math.round(size * 2));
  parsed.searchParams.set("twic", `v1/cover=${pixels}x${pixels}`);
  return parsed.toString();
}
