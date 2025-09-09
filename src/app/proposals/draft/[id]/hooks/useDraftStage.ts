"use client";

import { useMemo } from "react";
import Tenant from "@/lib/tenant/tenant";
import { GET_DRAFT_STAGES, getStageMetadata } from "../../utils/stages";
import { PLMConfig } from "../../types";

type SearchParams =
  | { [key: string]: string | string[] | undefined }
  | undefined;

export function useDraftStage(searchParams: SearchParams) {
  const stageParam = (searchParams?.stage || "0") as string;
  const stageIndex = useMemo(() => parseInt(stageParam, 10), [stageParam]);
  const DRAFT_STAGES_FOR_TENANT = GET_DRAFT_STAGES()!;
  const stageObject = DRAFT_STAGES_FOR_TENANT[stageIndex];
  const stageMetadata = getStageMetadata(stageObject.stage);

  const { ui, contracts } = Tenant.current();
  const config = ui.toggle("proposal-lifecycle")?.config as PLMConfig;
  const targetChainId = contracts.governor.chain.id;

  return {
    stageIndex,
    stageObject,
    stageMetadata,
    DRAFT_STAGES_FOR_TENANT,
    config,
    targetChainId,
  } as const;
}
