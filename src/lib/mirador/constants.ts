export const MIRADOR_TRACE_ID_HEADER = "x-mirador-trace-id";
export const MIRADOR_FLOW_HEADER = "x-mirador-flow";

export const MIRADOR_FLOW = {
  proposalCreation: "proposal_creation",
} as const;

export const MIRADOR_DEFAULT_TRACE_ID_WAIT_TIMEOUT_MS = 3000;
export const MIRADOR_DEFAULT_TRACE_ID_WAIT_INTERVAL_MS = 50;

export const PROPOSAL_CREATION_TRACE_NAME = "proposal_creation";
export const PROPOSAL_CREATION_TRACE_STORAGE_KEY =
  "agora:proposal-creation-trace";
