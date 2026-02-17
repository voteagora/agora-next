import Image from "next/image";
import checkIcon from "@/icons/check.svg";
import { X } from "lucide-react";
import { Proposal } from "@/app/api/common/proposals/proposal.d";
import { VotesBar } from "@/components/common/VotesBar";
import { StepperRow } from "@/components/common/StepperRow";

interface VotesSummaryTooltipProps {
  proposal: Proposal;
  totalForVotesPercentage: number;
  totalAgainstVotesPercentage: number;
  totalAbstainVotesPercentage: number;
  quorumPercentage: number;
  quorumMet: boolean;
  formatTime: (date: Date | null) => string;
  finalApproval: number;
}

export const HybridStandardVotesSummaryTooltip = ({
  proposal,
  totalForVotesPercentage,
  totalAgainstVotesPercentage,
  totalAbstainVotesPercentage,
  quorumPercentage,
  quorumMet,
  formatTime,
  finalApproval,
}: VotesSummaryTooltipProps) => {
  return (
    <div className="flex flex-col font-semibold text-xs">
      <div className="flex flex-col gap-2 p-4">
        <VotesBar
          forVotes={totalForVotesPercentage}
          againstVotes={totalAgainstVotesPercentage}
          abstainVotes={totalAbstainVotesPercentage}
          quorumPercentage={30}
          compact
        />
        <div className="flex justify-between text-positive">
          <span>FOR</span>
          <span>{totalForVotesPercentage.toFixed(2)}%</span>
        </div>
        <div className="flex justify-between text-secondary">
          <span>ABSTAIN</span>
          <span>{totalAbstainVotesPercentage.toFixed(2)}%</span>
        </div>
        <div className="flex justify-between text-negative">
          <span>AGAINST</span>
          <span>{totalAgainstVotesPercentage.toFixed(2)}%</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-b p-4 border-line">
        <div className="flex justify-between">
          <span className="text-secondary">Quorum</span>
          <div className="flex items-center gap-1">
            {quorumMet ? (
              <Image width="12" height="12" src={checkIcon} alt="check icon" />
            ) : (
              <X className="h-3 w-3 text-negative" />
            )}
            <span className={quorumMet ? "text-positive" : "text-negative"}>
              {quorumMet ? "Met" : "Not Met"} - {quorumPercentage.toFixed(2)}%
            </span>
          </div>
        </div>

        {proposal.approvalThreshold && (
          <div className="flex justify-between">
            <span className="text-secondary">Approval</span>
            <div className="flex items-center gap-1">
              {finalApproval * 100 >=
              Number(proposal.approvalThreshold) / 100 ? (
                <Image
                  width="12"
                  height="12"
                  src={checkIcon}
                  alt="check icon"
                />
              ) : (
                <X className="h-3 w-3 text-negative" />
              )}
              <span
                className={
                  finalApproval * 100 >=
                  Number(proposal.approvalThreshold) / 100
                    ? "text-positive"
                    : "text-negative"
                }
              >
                {finalApproval * 100 >= Number(proposal.approvalThreshold) / 100
                  ? "Met"
                  : "Not Met"}{" "}
                - {Number(finalApproval * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        )}
      </div>

      <ol className="overflow-hidden space-y-6 bg-wash p-4 rounded-br-lg rounded-bl-lg">
        <StepperRow
          label="Proposal created"
          value={formatTime(proposal.createdTime)}
          isCompleted
        />
        <StepperRow
          label="Voting period start"
          value={formatTime(proposal.startTime)}
          isCompleted
        />
        <StepperRow
          label="Voting period end"
          value={formatTime(proposal.endTime)}
          isCompleted
        />
        <StepperRow
          isLastStep
          label={`Proposal ${proposal.status?.toLowerCase()}`}
          value={
            proposal.status === "EXECUTED"
              ? formatTime(proposal.executedTime)
              : formatTime(proposal.endTime)
          }
          isCompleted
        />
      </ol>
    </div>
  );
};
