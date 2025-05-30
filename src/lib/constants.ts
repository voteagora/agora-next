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
} as const;

export const proposalsFilterOptions = {
  relevant: {
    value: "Relevant",
    filter: "relevant",
  },
  everything: {
    value: "Everything",
    filter: "everything",
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
};

export const citizensFilterOptions = {
  mostVotingPower: {
    value: "Most voting power",
    sort: "most_voting_power",
  },
  shuffle: {
    sort: "shuffle",
    value: "Shuffle",
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

export const disapprovalThreshold = 12;

export enum GOVERNOR_TYPE {
  AGORA = "AGORA",
  ALLIGATOR = "ALLIGATOR",
  BRAVO = "BRAVO",
  ENS = "ENS",
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
