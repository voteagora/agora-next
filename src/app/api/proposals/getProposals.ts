import {
  getProposalForNamespace,
  getProposalTypesForNamespace,
  getProposalsForNamespace,
} from "../common/proposals/getProposals";

import { proposalsFilterOptions } from "@/lib/constants";

export const getProposals = ({ filter = proposalsFilterOptions.relevant.filter, page = 1 }: {
  page: number,
  filter: string
}) =>
  getProposalsForNamespace({ filter, namespace: "optimism", page });

export const getProposal = ({ proposal_id }: { proposal_id: string }) =>
  getProposalForNamespace({ proposal_id, namespace: "optimism" });

export const getProposalTypes = () =>
  getProposalTypesForNamespace({ namespace: "optimism" });
