export const INDEXER_DELAY = 3000;

export const TENANT_NAMESPACES = {
  ENS: "ens",
  ETHERFI: "etherfi",
  OPTIMISM: "optimism",
  UNISWAP: "uniswap",
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
    value: "Weighted random",
  },
  mostVotingPower: {
    sort: "most_voting_power",
    value: "Most voting power",
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
