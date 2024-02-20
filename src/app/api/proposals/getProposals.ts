import {
  getProposalsForNamespace,
  getProposalForNamespace,
  getProposalTypesForNamespace,
} from "../common/proposals/getProposals";
import { ProposalFilter } from "@/app/api/proposals/proposal";

export const getProposals = (params: {
  page: number;
  filter: ProposalFilter;
}) => getProposalsForNamespace({ ...params, namespace: "optimism" });

export const getProposal = (params: { proposal_id: string }) =>
  getProposalForNamespace({ ...params, namespace: "optimism" });

export const getProposalTypes = () =>
  getProposalTypesForNamespace({ namespace: "optimism" });
