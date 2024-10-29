import { Proposal } from "@/app/api/common/proposals/proposal";
import { fetchVotersWhoHaveNotVotedForProposal } from "@/app/api/common/votes/getVotes";

const NotVotersCard = async ({ proposal }: { proposal: Proposal }) => {
  const voters = await fetchVotersWhoHaveNotVotedForProposal({
    proposalId: proposal.id,
  });

  console.log(voters);

  return <div>NotVotersCard</div>;
};

export default NotVotersCard;
