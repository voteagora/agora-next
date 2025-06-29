import { ProposalStrategy } from "../strategies/ProposalStrategy";
import { ProposalType } from "../types";

export interface ProposalTypeConfig {
  type: ProposalType;
  strategy: ProposalStrategy;
  displayName: string;
  description: string;
  features: {
    hasVotingReason: boolean;
    hasApprovalOptions: boolean;
    hasOptimisticVeto: boolean;
    hasOffchainComponent: boolean;
    hasHybridVoting: boolean;
  };
}
