import type { LegacyProposalType, ProposalKind } from "./taxonomy";

export interface ProposalModel {
  id: string;
  title: string;
  description: string | null;
  proposer: string;
  proposalType: LegacyProposalType;
  kind: ProposalKind;
  status: string | null;
}
