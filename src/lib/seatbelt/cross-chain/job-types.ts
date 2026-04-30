import type { BridgeKind, TenderlyPayload } from "../types";

export type CrossChainStepBuilderCtx = {
  simulationTimestamp?: bigint;
};

export type CrossChainPreparedStep = {
  label: string;
  buildPayload: (ctx: CrossChainStepBuilderCtx) => TenderlyPayload;
};

export type CrossChainExecutionJob = {
  bridge: BridgeKind;
  destinationChainId: number;
  sourceActionIndex: number;
  steps: CrossChainPreparedStep[];
};
