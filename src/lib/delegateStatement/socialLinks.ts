import Tenant from "@/lib/tenant/tenant";

/**
 * When enabled for a tenant, the `warpcast` column on delegate statements is
 * overloaded to hold a LinkedIn profile URL instead of a Warpcast handle.
 */
export function isWarpcastAsLinkedin(): boolean {
  const { ui } = Tenant.current();
  return ui.toggle("delegates/warpcast-as-linkedin")?.enabled ?? false;
}

export function buildWarpcastUrl(value: string): string {
  return `https://warpcast.com/${value.replace(/@/g, "")}`;
}

export function buildLinkedinUrl(value: string): string {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (/linkedin\.com/i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  const handle = trimmed.replace(/^[@/]+/, "");
  return `https://www.linkedin.com/in/${handle}`;
}
