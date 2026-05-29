import { MIRADOR_TRACE_TAG } from "./constants";
import { MiradorFlow } from "./types";

export function getTenantTag(): string | undefined {
  return process.env.NEXT_PUBLIC_AGORA_INSTANCE_NAME || undefined;
}

export function getMiradorFlowTags(
  flow: MiradorFlow,
  extraTags: string[] = []
): string[] {
  const tenantTag = getTenantTag();
  return Array.from(
    new Set(
      [flow, tenantTag, ...extraTags].filter((tag) => typeof tag === "string")
    )
  );
}

export function getMiradorSiweLoginTags(flow: MiradorFlow): string[] {
  return getMiradorFlowTags(flow, [MIRADOR_TRACE_TAG.siweLogin]);
}
