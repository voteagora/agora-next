import { VoterTypes } from "@/app/api/common/votes/vote";
import { type Chain } from "viem";
import {
  mainnet,
  sepolia,
  optimism,
  scroll,
  linea,
  lineaSepolia,
  cyber,
} from "viem/chains";
import { TenantNamespace } from "./types";

export const INDEXER_DELAY = 3000;

export const SECONDS_IN_HOUR = 3600;

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export enum FREQUENCY_FILTERS {
  DAY = "24h",
  WEEK = "7d",
  MONTH = "1m",
  QUARTER = "3m",
  YEAR = "1y",
}

export enum PROPOSAL_STATUS {
  ACTIVE = "ACTIVE",
  CANCELLED = "CANCELLED",
  CLOSED = "CLOSED",
  DEFEATED = "DEFEATED",
  EXECUTED = "EXECUTED",
  PENDING = "PENDING",
  QUEUED = "QUEUED",
  SUCCEEDED = "SUCCEEDED",
}

export enum DELEGATION_MODEL {
  FULL = "FULL",
  ADVANCED = "ADVANCED",
  PARTIAL = "PARTIAL",
}

export const TENANT_NAMESPACES = {
  ENS: "ens",
  ETHERFI: "etherfi",
  OPTIMISM: "optimism",
  UNISWAP: "uniswap",
  CYBER: "cyber",
  SCROLL: "scroll",
  DERIVE: "derive",
  PGUILD: "pguild",
  BOOST: "boost",
  XAI: "xai",
  B3: "b3",
  DEMO: "demo",
  LINEA: "linea",
  TOWNS: "towns",
  SYNDICATE: "syndicate",
} as const;

// SIWE localStorage keys
export const LOCAL_STORAGE_SIWE_JWT_KEY = "agora-siwe-jwt";
export const LOCAL_STORAGE_SIWE_STAGE_KEY = "agora-siwe-stage";

// EIP-1271 magic value returned by isValidSignature on success
export const EIP1271_MAGIC_VALUE = "0x1626ba7e";

// Canonical set of chains we support across tenants for read-only ops (e.g., 1271 checks)
// Note: tenant-derived chains (e.g., deriveMainnet) are appended in helpers to avoid cycles
export const SUPPORTED_CHAINS: Chain[] = [
  mainnet,
  sepolia,
  optimism,
  scroll,
  linea,
  lineaSepolia,
  cyber,
];

export const proposalsFilterOptions = {
  relevant: {
    value: "Relevant",
    filter: "relevant",
  },
  everything: {
    value: "Everything",
    filter: "everything",
  },
  tempChecks: {
    value: "Temp Checks",
    filter: "temp-checks",
  },
};

export const delegatesFilterOptions = {
  weightedRandom: {
    sort: "weighted_random",
    value: "Random (default)",
  },
  mostVotingPower: {
    sort: "most_voting_power",
    value: "Most voting power",
  },
  leastVotingPower: {
    sort: "least_voting_power",
    value: "Least voting power",
  },
  mostDelegators: {
    sort: "most_delegators",
    value: "Most delegators",
  },
  mostRecentDelegation: {
    sort: "most_recent_delegation",
    value: "Most recently delegated",
  },
  oldestDelegation: {
    sort: "oldest_delegation",
    value: "Oldest delegation",
  },
  latestVotingBlock: {
    sort: "latest_voting_block",
    value: "Latest voting block",
  },
  vpChange7d: {
    sort: "vp_change_7d",
    value: "7d VP Change Increase",
  },
  vpChange7dDesc: {
    sort: "vp_change_7d_desc",
    value: "7d VP Change Decrease",
  },
};

export const delegatesVotesSortOptions = {
  newest: {
    sortOrder: "desc",
    value: "Newest",
  },
  oldest: {
    sortOrder: "asc",
    value: "Oldest",
  },
};

export const retroPGFCategories = {
  ALL: {
    filter: "All projects",
  },
  COLLECTIVE_GOVERNANCE: {
    text: "Collective Governance",
    filter: "Collective Governance (104)",
  },
  DEVELOPER_ECOSYSTEM: {
    text: "Developer Ecosystem",
    filter: "Developer Ecosystem (304)",
  },
  END_USER_EXPERIENCE_AND_ADOPTION: {
    text: "End UX & Adoption",
    filter: "End User Experience & Adoption (472)",
  },
  OP_STACK: {
    text: "OP Stack",
    filter: "OP Stack (165)",
  },
};

export const retroPGFSort = {
  mostAwarded: "by most RPGF received",
  alphabeticalAZ: "Alphabetical (A-Z)",
  alphabeticalZA: "Alphabetical (Z-A)",
  shuffle: "Shuffle",
  byIncludedInBallots: "Least in ballots",
  mostInBallots: "Most in ballots",
};

export const disapprovalThreshold = 20;

export enum GOVERNOR_TYPE {
  AGORA = "AGORA",
  ALLIGATOR = "ALLIGATOR",
  BRAVO = "BRAVO",
  ENS = "ENS",
}

export enum PROPOSAL_TYPES_CONFIGURATOR_FACTORY {
  WITH_DESCRIPTION = "WITH_DESCRIPTION",
  WITHOUT_DESCRIPTION = "WITHOUT_DESCRIPTION",
}

export enum TIMELOCK_TYPE {
  TIMELOCK_NO_ACCESS_CONTROL = "TIMELOCK_NO_ACCESS_CONTROL",
  TIMELOCKCONTROLLER_WITH_ACCESS_CONTROL = "TIMELOCKCONTROLLER_WITH_ACCESS_CONTROL",
  TIMELOCKCONTROLLER_WITH_ACCESS_CONTROL_ERC721_ERC115 = "TIMELOCKCONTROLLER_WITH_ACCESS_CONTROL_ERC721_ERC115",
}
export const ENDORSED_FILTER_PARAM = "endorsedFilter";
export const HAS_STATEMENT_FILTER_PARAM = "hasStatement";
export const MY_DELEGATES_FILTER_PARAM = "delegatorFilter";
export const ISSUES_FILTER_PARAM = "issueFilter";
export const STAKEHOLDERS_FILTER_PARAM = "stakeholderFilter";

export const OFFCHAIN_THRESHOLDS = { APP: 100, USER: 1000, CHAIN: 15 };
export const CITIZEN_TYPES = ["USER", "APP", "CHAIN"] as const;

export const HYBRID_VOTE_WEIGHTS = {
  delegates: 0.5,
  apps: 1 / 6,
  users: 1 / 6,
  chains: 1 / 6,
} as const;

export const HYBRID_PROPOSAL_QUORUM = 0.3;

export const HYBRID_OPTIMISTIC_TIERED_THRESHOLD = [55, 45, 35];
export const OFFCHAIN_OPTIMISTIC_TIERED_THRESHOLD = [65, 65, 65];
export const OFFCHAIN_OPTIMISTIC_THRESHOLD = [20, 20, 20];

export const VOTER_TYPES: VoterTypes[] = [
  {
    type: "APP",
    value: "Citizen House: Apps",
  },
  {
    type: "CHAIN",
    value: "Citizen House: Chains",
  },
  {
    type: "USER",
    value: "Citizen House: Users",
  },
  {
    type: "TH", // used as default in voter/hasnt voted list apis
    value: "Token House",
  },
];

export const ADMIN_TYPES: Record<string, string> = {
  duna_admin: "DUNA_ADMIN",
  admin: "ADMIN",
  super_admin: "SUPER_ADMIN",
};

export const TENANT_PROPOSAL_SOURCES: Record<
  TenantNamespace,
  readonly string[]
> = {
  optimism: ["dao-node", "eas-atlas"], // order in these will also determine, which source will be used incase of
  ens: ["dao-node", "snapshot"],
  derive: ["snapshot"],
  etherfi: ["snapshot"],
  uniswap: ["dao-node"],
  cyber: ["dao-node"],
  scroll: ["dao-node"],
  linea: ["dao-node"],
  pguild: ["dao-node"],
  boost: ["dao-node"],
  xai: ["dao-node"],
  b3: ["dao-node"],
  demo: ["dao-node"],
  syndicate: ["eas-oodao"],
  towns: ["dao-node"],
};

export const ARCHIVE_GCS_BUCKET =
  process.env.NEXT_PUBLIC_AGORA_ENV === "prod"
    ? "https://storage.googleapis.com/cpls-usmr-prd-25q4"
    : "https://storage.googleapis.com/cpls-usmr-dev-25q3";

export const getArchiveSlugGCSbucket = (namespace: string) => {
  return `${ARCHIVE_GCS_BUCKET}/data/${namespace}`;
};

// =============================================================================
// Proposal List URL Getters
// =============================================================================

export const getArchiveDaoNodeProposals = (namespace: string) => {
  return `${getArchiveSlugGCSbucket(namespace)}/proposal_list/dao_node/raw.ndjson.gz`;
};

export const getArchiveEasOodaoProposals = (namespace: string) => {
  return `${getArchiveSlugGCSbucket(namespace)}/proposal_list/eas-oodao/raw.ndjson.gz`;
};

export const getArchiveEasAtlas = (namespace: string) => {
  return `${getArchiveSlugGCSbucket(namespace)}/proposal_list/eas-atlas/raw.ndjson.gz`;
};

export const getArchiveSnapshotProposals = (namespace: string) => {
  return `${getArchiveSlugGCSbucket(namespace)}/proposal_list/snapshot/raw.ndjson.gz`;
};

// =============================================================================
// Single Proposal URL Getters
// =============================================================================

export const getArchiveSlugForDaoNodeProposal = (
  namespace: string,
  proposalId: string
): string => {
  return `${getArchiveSlugGCSbucket(namespace)}/proposal/dao_node/raw/${proposalId}.json.gz`;
};

export const getArchiveSlugForEasOodaoProposal = (
  namespace: string,
  proposalId: string
): string => {
  return `${getArchiveSlugGCSbucket(namespace)}/proposal/eas-oodao/raw/${proposalId}.json.gz`;
};

export const getArchiveSlugForEasAtlasProposal = (
  namespace: string,
  proposalId: string
): string => {
  return `${getArchiveSlugGCSbucket(namespace)}/proposal/eas-atlas/raw/${proposalId}.json.gz`;
};

export const getArchiveForSnapshotProposal = (
  namespace: string,
  proposalId: string
): string => {
  return `${getArchiveSlugGCSbucket(namespace)}/proposal/snapshot/raw/${proposalId}.json.gz`;
};

// =============================================================================
// Source-based URL Mappings (must be after getter definitions)
// =============================================================================

/**
 * Maps source names to their proposal list URL getter functions
 */
const SOURCE_TO_LIST_URL: Record<string, (namespace: string) => string> = {
  dao_node: getArchiveDaoNodeProposals,
  "dao-node": getArchiveDaoNodeProposals,
  "eas-atlas": getArchiveEasAtlas,
  "eas-oodao": getArchiveEasOodaoProposals,
  snapshot: getArchiveSnapshotProposals,
};

/**
 * Maps source names to their single proposal URL getter functions
 */
const SOURCE_TO_PROPOSAL_URL: Record<
  string,
  (namespace: string, proposalId: string) => string
> = {
  dao_node: getArchiveSlugForDaoNodeProposal,
  "dao-node": getArchiveSlugForDaoNodeProposal,
  "eas-atlas": getArchiveSlugForEasAtlasProposal,
  "eas-oodao": getArchiveSlugForEasOodaoProposal,
  snapshot: getArchiveForSnapshotProposal,
};

/**
 * Generates archive URLs for all proposal sources for a given namespace
 */
export const getArchiveSlugAllProposals = (namespace: string): string[] => {
  const sources = TENANT_PROPOSAL_SOURCES[namespace as TenantNamespace];
  // if (!sources || sources.length === 0) {
  return [`${getArchiveSlugGCSbucket(namespace)}/proposal_list.full.ndjson.gz`];
  // }

  // return sources
  //   .map((source) => SOURCE_TO_LIST_URL[source]?.(namespace))
  //   .filter((url): url is string => !!url);
};

/**
 * Gets archive URLs for a single proposal based on tenant's sources
 */
export const getArchiveUrlsForProposal = (
  namespace: string,
  proposalId: string
): string[] => {
  const sources = TENANT_PROPOSAL_SOURCES[namespace as TenantNamespace];
  if (!sources || sources.length === 0) {
    // Fallback to dao_node for unknown namespaces
    return [getArchiveSlugForDaoNodeProposal(namespace, proposalId)];
  }

  return sources
    .map((source) => SOURCE_TO_PROPOSAL_URL[source]?.(namespace, proposalId))
    .filter((url): url is string => !!url);
};

export const getArchiveSlugForProposalVotes = (
  namespace: string,
  proposalId: string
): string => {
  return `${getArchiveSlugGCSbucket(namespace)}/votes/${proposalId}.ndjson.gz`;
};

export const getArchiveSlugForProposalNonVoters = (
  namespace: string,
  proposalId: string
) => {
  return `${getArchiveSlugGCSbucket(namespace)}/hasnt_voted/${proposalId}.ndjson.gz`;
};
