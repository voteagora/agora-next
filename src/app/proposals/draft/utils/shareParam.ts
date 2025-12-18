export function buildDraftUrl(
  draftId: string | number,
  stage: number,
  shareParam?: string | null
): string {
  const base = `/proposals/draft/${draftId}?stage=${stage}`;
  return shareParam ? `${base}&share=${shareParam}` : base;
}

export function getShareParamFromWindow(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("share");
}
