import { Proposal } from "@/app/api/common/proposals/proposal";
import { Vote } from "@/app/api/common/votes/vote";
import { Bar } from "recharts";

interface Props {
  proposal: Proposal;
  votes: Vote[] | undefined;
}

type Support = "FOR" | "ABSTAIN" | "AGAINST";

export default function ProposalVotesBar({ proposal, votes }: Props) {
  const thresholdPercent = Math.round(Number(proposal.approvalThreshold) / 100);
  const voteCounts: Record<Support, Vote[]> = {
    FOR: [],
    ABSTAIN: [],
    AGAINST: [],
  };

  if (!votes) {
    return <BarSkeleton />;
  }

  votes.forEach((vote) => {
    voteCounts[vote.support as Support].push(vote);
  });

  const hasVotes = votes.length > 0;
  const totalVotes = votes.length;

  return (
    <div id="chartContainer" className="relative flex items-stretch gap-x-0.5">
      {hasVotes ? (
        <>
          {totalVotes > 100
            ? Object.entries(voteCounts).map(([support, parsedVotes]) => (
                <div
                  key={support} // use support as a unique key
                  style={{
                    flex: `${(proposal.proposalResults as any)[support.toLowerCase()]} 1 0%`,
                  }}
                  className="flex items-stretch gap-x-0.5 min-h-[10px]"
                >
                  <div
                    style={{ flex: `1 1 0%` }}
                    className={`min-w-[1px] ${support === "FOR" ? "bg-positive" : support === "AGAINST" ? "bg-negative" : "bg-tertiary"}`}
                  ></div>
                </div>
              ))
            : Object.entries(voteCounts).map(([support, parsedVotes]) => (
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
                      className={`min-w-[1px] ${support === "FOR" ? "bg-positive" : support === "AGAINST" ? "bg-negative" : "bg-neutral"}`}
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

const BarSkeleton = () => {
  return (
    <div className="flex animate-pulse">
      <div className="w-full h-[10px] bg-tertiary/10"></div>
    </div>
  );
};
