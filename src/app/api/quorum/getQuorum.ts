import { ProposalPayload } from "../common/proposals/proposal";
import {
  getCurrentQuorumForNamespace,
  getQuorumForProposalForNamespace,
} from "../common/quorum/getQuorum";

export const getQuorumForProposal = (proposal: ProposalPayload) =>
  getQuorumForProposalForNamespace(proposal);

export const getCurrentQuorum = () => getCurrentQuorumForNamespace("optimism");
