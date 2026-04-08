export type SyncState = {
  id: string;
  chainId: string;
  latestProcessedBlock: string;
  latestProcessedTimestamp: string | null;
  latestProcessedHash: string | null;
  mode: string;
  updatedAt: string;
};

export type DonationRecord = {
  id: string;
  donor: string;
  beneficiary: string;
  asset: string;
  amount: string;
  votingPower: string;
  blockNumber: string;
  blockTimestamp: string;
  txHash: string;
  createdAt: string;
};

export type DonationSettingsRecord = {
  id: string;
  minimumDonation: string;
  updatedAtBlock: string;
  updatedAtTimestamp: string;
  txHash: string;
  updatedAt: string;
};

export type FellowRecord = {
  id: string;
  member: string;
  active: boolean;
  monthlySalary: string;
  ratePerBlockWad: string;
  lastAccruedBlock: string | null;
  unclaimedAmount: string;
  claimableAmount: string;
  addedAtBlock: string | null;
  removedAtBlock: string | null;
  updatedAtBlock: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SalaryClaimRecord = {
  id: string;
  member: string;
  amount: string;
  blockNumber: string;
  blockTimestamp: string;
  txHash: string;
  createdAt: string;
};

export type TreasuryTransferRecord = {
  id: string;
  recipient: string;
  amount: string;
  transferType: string;
  blockNumber: string;
  blockTimestamp: string;
  txHash: string;
  proposalId: string | null;
  createdAt: string;
};

export type VoteRecord = {
  id: string;
  proposalId: string;
  voter: string;
  support: number;
  weight: string;
  reason: string | null;
  blockNumber: string;
  blockTimestamp: string;
  txHash: string;
  createdAt: string;
};

export type ProposalActionRecord = {
  id: string;
  proposalId: string;
  target: string;
  selector: string;
  actionType: string;
  recipient: string | null;
  member: string | null;
  amount: string | null;
  monthlySalary: string | null;
  rawData: string;
  createdAt: string;
};

export type ProposalMetadataRecord = {
  proposalId: string;
  title: string;
  summary: string | null;
  body: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProposalRecord = {
  id: string;
  proposalId: string;
  proposer: string;
  target: string;
  proposalType: string;
  value: string;
  calldata: string;
  description: string | null;
  snapshotBlock: string;
  deadlineBlock: string;
  createdBlock: string;
  createdTimestamp: string;
  queuedAt: string | null;
  eta: string | null;
  executedAt: string | null;
  operationId: string | null;
  state: string;
  forVotes: string;
  againstVotes: string;
  abstainVotes: string;
  quorumVotes: string | null;
  createdAt: string;
  updatedAt: string;
  actions: ProposalActionRecord[];
  votes: VoteRecord[];
  metadata: ProposalMetadataRecord | null;
};

export type DashboardSummary = {
  donationCount: number;
  proposalCount: number;
  activeFellowCount: number;
  salaryClaimCount: number;
  treasuryTransferCount: number;
  totalDonated: string;
  totalGranted: string;
  totalClaimedSalary: string;
  syncState: SyncState | null;
};
