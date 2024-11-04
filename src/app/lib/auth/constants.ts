// Errors
export const REASON_NO_TOKEN = "No token provided in 'Authorization' header";
export const REASON_INVALID_BEARER_TOKEN = "Invalid Bearer Token";
export const REASON_INVALID_TOKEN = "Invalid format for API Key or JWT";
export const REASON_DISABLED_USER = "User disabled";
export const REASON_TOKEN_EXPIRED = "JWT expired";
export const REASON_TOKEN_NO_EXPIRY = "JWT has no expiry time";
export const REASON_TOKEN_NO_SCOPE = "JWT has no scope";
export const REASON_TOKEN_SCOPE_ROUTE_MISMATCH =
  "JWT scope does not match route";

// Roles
export const ROLE_PUBLIC_READER = "reader:public";
export const ROLE_BADGEHOLDER = "badgeholder";
export const ROLE_CITIZEN = "citizen";
export const ROLE_RF_DEMO_USER = "rf-demo-user";
// export const ROLE_CATEGORY_ETH_CORE = "category:ethereum_core_contributions";
// export const ROLE_CATEGORY_OP_STACK =
//   "category:op_stack_research_and_development";
// export const ROLE_CATEGORY_OP_STACK_TOOLING = "category:op_stack_tooling";
export const ROLE_CATEGORY_GOV_INFRA = "category:governance_infra_and_tooling";
export const ROLE_CATEGORY_GOV_ANALYTICS = "category:governance_analytics";
export const ROLE_CATEGORY_GOV_LEADERSHIP = "category:governance_leadership";

export const CATEGORY_ROLES = {
  GOVERNANCE_ANALYTICS: ROLE_CATEGORY_GOV_ANALYTICS,
  GOVERNANCE_INFRA_AND_TOOLING: ROLE_CATEGORY_GOV_INFRA,
  GOVERNANCE_LEADERSHIP: ROLE_CATEGORY_GOV_LEADERSHIP,
};
