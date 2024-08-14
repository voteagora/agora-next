import { Proposal } from "@/app/api/common/proposals/proposal";
import { Vote } from "@/app/api/common/votes/vote";

interface Props {
  proposal: Proposal;
  votes: Vote[];
}

type Support = "FOR" | "ABSTAIN" | "AGAINST";

export default function ProposalVotesBar({ proposal, votes }: Props) {
  const thresholdPercent = Math.round(Number(proposal.approvalThreshold) / 100);
  const voteCounts: Record<Support, Vote[]> = {
    FOR: [],
    ABSTAIN: [],
    AGAINST: [],
  };

  votes.forEach((vote) => {
    voteCounts[vote.support as Support].push(vote);
  });

  const hasVotes = votes.length > 0;

  return (
    <div id="chartContainer" className="relative flex items-stretch gap-x-0.5">
      {hasVotes ? (
        <>
          {Object.entries(voteCounts).map(([support, parsedVotes]) => (
            <div
              key={support} // use support as a unique key
              style={{
                flex: `${(proposal.proposalResults as any)[support.toLowerCase()]} 1 0%`,
              }}
              className="flex items-stretch gap-x-0.5 min-h-[10px]"
            >
              {parsedVotes?.map((vote: Vote, idx) => (
                <div
                  key={`${support}-${idx}`} // use a combination of support and idx as a unique key
                  style={{ flex: `${vote.weight} 1 0%` }}
                  className={`min-w-[1px] ${support === "FOR" ? "bg-[#41b579]" : support === "AGAINST" ? "bg-[#db5664]" : "bg-[#666666]"}`}
                ></div>
              ))}
            </div>
          ))}
        </>
      ) : (
        <div className="w-full bg-wash h-[10px]"></div>
      )}

      {proposal.approvalThreshold && (
        <div
          className="bg-primary h-4 w-[2px] absolute -top-[3px] z-50"
          style={{ left: `${thresholdPercent}%` }}
        />
      )}
    </div>
  );
}
