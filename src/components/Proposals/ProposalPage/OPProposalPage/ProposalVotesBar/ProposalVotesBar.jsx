import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TokenAmountDisplay } from "@/lib/utils";

export default function ProposalVotesBar({ proposal, proposalVotes }) {
  const voteCounts = {
    FOR: [],
    ABSTAIN: [],
    AGAINST: [],
  };

  proposalVotes.forEach((item) => {
    voteCounts[item.support].push(item);
  });

  const totalVotesVolume =
    parseFloat(proposal?.proposalResults?.for) +
    parseFloat(proposal?.proposalResults?.abstain) +
    parseFloat(proposal?.proposalResults?.against);

  const quorumPercentage =
    (totalVotesVolume / parseFloat(proposal.quorum)) * 100;

  return (
    <div>
      <TooltipProvider delayDuration={10}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`relative flex items-stretch gap-x-0.5 `}>
              {Object.entries(voteCounts).map(([support, votes]) => (
                <>
                  <div
                    key={support}
                    style={{
                      flex: `${proposal.proposalResults[support.toLowerCase()]} 1 0%`,
                    }}
                    className={`flex items-stretch gap-x-0.5 min-h-[10px]`}
                  >
                    {votes?.map((vote, idx) => (
                      <div
                        key={`${support}-${idx}`}
                        style={{ flex: `${vote.weight} 1 0%` }}
                        className={`min-w-[1px] ${support === "FOR" ? "bg-[#41b579]" : support === "AGAINST" ? "bg-[#db5664]" : "bg-[#666666]"}`}
                      ></div>
                    ))}
                  </div>
                </>
              ))}
              {!!quorumPercentage && (
                <div
                  className={`bg-[#d89900] h-4 w-[4px] absolute left-[${quorumPercentage}%] -top-[3px] z-50`}
                />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {TokenAmountDisplay({
                amount: proposal.proposalResults.abstain,
              })}{" "}
              abstained
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
