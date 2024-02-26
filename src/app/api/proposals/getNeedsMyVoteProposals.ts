import { getNeedsMyVoteProposalsForNamespace } from "../common/proposals/getNeedsMyVoteProposals";

export const getNeedsMyVoteProposals = ({ address }: { address: string }) =>
  getNeedsMyVoteProposalsForNamespace({
    address,
    namespace: "optimism",
  });
