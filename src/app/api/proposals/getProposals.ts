import {
  getProposalForNamespace,
  getProposalTypesForNamespace,
  getProposalsForNamespace,
} from "../common/proposals/getProposals";

export const getProposals = ({ page = 1 }: { page: number }) =>
  getProposalsForNamespace({ page, namespace: "optimism" });

export const getProposal = ({ proposal_id }: { proposal_id: string }) =>
  getProposalForNamespace({ proposal_id, namespace: "optimism" });

export const getProposalTypes = () =>
  getProposalTypesForNamespace({ namespace: "optimism" });
