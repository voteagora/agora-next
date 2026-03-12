import { MIRADOR_TRACE_TAG } from "./constants";
import { MiradorFlow } from "./types";

export function getMiradorFlowTags(
  flow: MiradorFlow,
  extraTags: string[] = []
): string[] {
  return Array.from(
    new Set([flow, ...extraTags].filter((tag) => typeof tag === "string"))
  );
}

export function getMiradorSiweLoginTags(flow: MiradorFlow): string[] {
  return getMiradorFlowTags(flow, [MIRADOR_TRACE_TAG.siweLogin]);
}
