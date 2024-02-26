import { ProposalPayload } from "../common/proposals/proposal";
import {
  getCurrentQuorumForNamespace,
  getQuorumForProposalForNamespace,
} from "../common/quorum/getQuorum";

export const getQuorumForProposal = (proposal: ProposalPayload) =>
  getQuorumForProposalForNamespace({ proposal, namespace: "optimism" });

export const getCurrentQuorum = () => getCurrentQuorumForNamespace("optimism");
