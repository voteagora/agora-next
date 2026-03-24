export const MIRADOR_TRACE_ID_HEADER = "x-mirador-trace-id";
export const MIRADOR_FLOW_HEADER = "x-mirador-flow";

export const MIRADOR_FLOW = {
  proposalCreation: "proposal_creation",
  notificationPreferences: "notification_preferences",
  delegateStatement: "delegate_statement",
} as const;

export const PROPOSAL_CREATION_TRACE_NAME = "proposal_creation";
export const PROPOSAL_CREATION_TRACE_STORAGE_KEY =
  "agora:proposal-creation-trace";
export const MIRADOR_SIWE_LOGIN_TRACE_STORAGE_KEY =
  "agora:mirador-siwe-login-trace";

export const MIRADOR_TRACE_TAG = {
  siweLogin: "siwe_login",
} as const;
