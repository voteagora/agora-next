import TokenAmountDecorated from "@/components/shared/TokenAmountDecorated";
import { Proposal } from "@/app/api/common/proposals/proposal";
import {
  ParsedProposalData,
  calculateHybridApprovalOptionVotes,
  calculateHybridApprovalWeightedPercentage,
  calculateHybridApprovalMetrics,
} from "@/lib/proposalUtils";
import { parseUnits } from "viem";
import { formatNumber } from "@/lib/utils";
import { tokenForContractAddress } from "@/lib/tokenUtils";
import Tenant from "@/lib/tenant/tenant";
import { cn } from "@/lib/utils";
import * as Collapsible from "@radix-ui/react-collapsible";
import { useState } from "react";
import { ExpandCollapseIcon } from "@/icons/ExpandCollapseIcon";
import VotesGroupTable from "@/components/common/VotesGroupTable";
import { getScaledBarPercentage } from "./OptionResultsPanel";
import { HYBRID_VOTE_WEIGHTS } from "@/lib/constants";

const { contracts, ui } = Tenant.current();
export default function HybridOptionsResultsPanel({
  proposal,
  className,
  optionsToShow = 5,
  showAllOptions = true,
}: {
  proposal: Proposal;
  className?: string;
  optionsToShow?: number;
  showAllOptions?: boolean;
}) {
  const proposalData =
    proposal.proposalData as ParsedProposalData["HYBRID_APPROVAL"]["kind"];

  const { decimals: contractTokenDecimals } = tokenForContractAddress(
    proposalData.proposalSettings.budgetToken
  );

  //   const criteriaValue = BigInt(proposalData.proposalSettings.criteriaValue);
  const criteriaValue = BigInt(100000);
  const proposalResults = proposal.proposalResults as unknown as {
    options: { option: string; votes: bigint }[];
    PROJECT: Record<string, bigint>;
    USER: Record<string, bigint>;
    CHAIN: Record<string, bigint>;
    DELEGATES?: Record<string, bigint>;
    criteria: "THRESHOLD" | "TOP_CHOICES";
    criteriaValue: bigint;
  };

  const proposalSettings = proposalData.proposalSettings;
  const options = proposalResults.options;

  // Use shared utility to calculate all hybrid approval metrics
  const hybridMetrics = calculateHybridApprovalMetrics(
    proposalResults,
    Number(proposal.quorum),
    Number(criteriaValue)
  );

  // Use shared utility function to calculate votes for an option
  const calculateOptionVotes = (optionName: string) => {
    return calculateHybridApprovalOptionVotes(optionName, proposalResults);
  };

  // Calculate weighted percentage for an option
  const calculateOptionWeightedPercentage = (optionName: string) => {
    return calculateHybridApprovalWeightedPercentage(
      optionName,
      proposalResults,
      Number(proposal.quorum)
    );
  };

  // Calculate total weighted participation across all options (for display purposes)
  let totalWeightedParticipation = 0;
  for (const option of options) {
    totalWeightedParticipation += calculateOptionWeightedPercentage(
      option.option
    );
  }

  // Calculate threshold position based on weighted percentages
  const thresholdPosition = (() => {
    if (proposalSettings.criteria === "THRESHOLD") {
      const thresholdPercentage = Number(criteriaValue) / 100; // Convert to percentage (e.g., 10 -> 0.1)
      const totalWeightedParticipation =
        hybridMetrics.totalWeightedParticipation;

      if (totalWeightedParticipation < thresholdPercentage * 1.5) {
        return 66;
      } else {
        // Calculate threshold position based on weighted participation, min 5% max 66%
        return totalWeightedParticipation > 0
          ? Math.max(
              (thresholdPercentage / totalWeightedParticipation) * 100,
              5
            )
          : 5;
      }
    }
    return 0;
  })();

  let availableBudget = BigInt(proposalSettings.budgetAmount);
  let isExceeded = false;

  const mutableOptions = [...options];
  const sortedOptions = mutableOptions
    .map((option, i) => {
      return { ...option, ...proposalData.options[i] };
    })
    .sort((a, b) => {
      // Sort by weighted percentage first, then by raw votes as tiebreaker
      const aWeightedPercentage = calculateOptionWeightedPercentage(a.option);
      const bWeightedPercentage = calculateOptionWeightedPercentage(b.option);

      if (aWeightedPercentage !== bWeightedPercentage) {
        return bWeightedPercentage > aWeightedPercentage ? 1 : -1;
      }

      // Tiebreaker: use raw votes
      const aVotes = calculateHybridApprovalOptionVotes(
        a.option,
        proposalResults
      );
      const bVotes = calculateHybridApprovalOptionVotes(
        b.option,
        proposalResults
      );
      return bVotes > aVotes ? 1 : bVotes < aVotes ? -1 : 0;
    });

  return (
    <div
      className={cn(
        "flex flex-col max-h-[calc(100vh-544px)] overflow-y-auto flex-shrink p-4 min-h-[36px]",
        className
      )}
    >
      {sortedOptions
        .slice(0, showAllOptions ? sortedOptions.length : optionsToShow)
        .map((option, index) => {
          let isApproved = false;

          const votesFromAllCategories = calculateHybridApprovalOptionVotes(
            option.option,
            proposalResults
          );
          const weightedPercentage = calculateOptionWeightedPercentage(
            option.option
          );

          const optionBudget =
            (proposal?.createdTime as Date) >
            contracts.governor.optionBudgetChangeDate!
              ? BigInt(option?.budgetTokensSpent || 0)
              : parseUnits(
                  option?.budgetTokensSpent?.toString() || "0",
                  contractTokenDecimals
                );

          if (proposalSettings.criteria === "TOP_CHOICES") {
            isApproved = index < Number(criteriaValue);
          } else if (proposalSettings.criteria === "THRESHOLD") {
            // Use weighted percentage for threshold checking
            const thresholdPercentage = Number(criteriaValue) / 100; // Convert to percentage (e.g., 10 -> 0.1)
            isApproved =
              !isExceeded &&
              weightedPercentage >= thresholdPercentage &&
              availableBudget >= optionBudget;
            if (isApproved) {
              availableBudget = availableBudget - optionBudget;
            } else {
              isExceeded = true;
            }
          }

          return (
            <SingleOption
              key={index}
              description={option.option}
              votesFromAllCategories={votesFromAllCategories}
              totalWeightedParticipation={totalWeightedParticipation}
              proposalSettings={proposalSettings}
              thresholdPosition={thresholdPosition}
              isApproved={isApproved}
              option={option}
              proposalResults={proposalResults}
              weightedPercentage={weightedPercentage}
            />
          );
        })}
      {!showAllOptions && sortedOptions.length > optionsToShow && (
        <div className="flex justify-center items-center text-primary bg-wash rounded-lg p-2 w-24 ml-auto">
          +{sortedOptions.length - optionsToShow} more
        </div>
      )}
    </div>
  );
}

function SingleOption({
  description,
  votesFromAllCategories,
  totalWeightedParticipation,
  proposalSettings,
  thresholdPosition,
  isApproved,
  option,
  proposalResults,
  weightedPercentage,
}: {
  description: string;
  votesFromAllCategories: bigint;
  totalWeightedParticipation: number;
  proposalSettings: any;
  thresholdPosition: number;
  isApproved: boolean;
  option: any;
  proposalResults: any;
  weightedPercentage: number;
}) {
  const criteriaValue = BigInt(100);

  const [isOpen, setIsOpen] = useState(false);
  let barPercentage = BigInt(0);

  // Use weighted percentage for all display calculations
  const weightedParticipationPercentage =
    totalWeightedParticipation === 0
      ? BigInt(0)
      : BigInt(
          Math.round((weightedPercentage / totalWeightedParticipation) * 10000)
        ); // Convert to 0-10000 scale for consistency

  // Convert weighted percentage to display format (0-100 scale)
  const weightedDisplayPercentage = BigInt(
    Math.round(weightedPercentage * 10000)
  );

  if (proposalSettings.criteria === "TOP_CHOICES") {
    barPercentage = weightedParticipationPercentage; // Use weighted percentage for top choices
  } else if (proposalSettings.criteria === "THRESHOLD") {
    // For threshold, use weighted percentage in bar calculation
    const threshold = BigInt(criteriaValue);
    barPercentage = getScaledBarPercentage({
      threshold,
      totalVotingPower: BigInt(Math.round(totalWeightedParticipation * 10000)), // Use total weighted participation
      votesAmountBN: weightedDisplayPercentage,
      thresholdPosition,
    });
  }

  // Calculate vote data for each category
  const { token } = Tenant.current();
  const getVoteData = (
    category: string,
    displayName: string,
    weight: number
  ) => {
    const votes = proposalResults[category as keyof typeof proposalResults]?.[
      option.option
    ]
      ? BigInt(
          proposalResults[category as keyof typeof proposalResults][
            option.option
          ]
        )
      : 0n;
    return {
      name: displayName,
      votes: formatNumber(votes, token.decimals),
      percentage:
        votes && votesFromAllCategories > 0n
          ? (votes * 100n) / votesFromAllCategories
          : 0n,
      weight: weight.toFixed(3),
    };
  };

  const voteGroups = [
    getVoteData("DELEGATES", "Delegates", HYBRID_VOTE_WEIGHTS.delegates),
    getVoteData("CHAIN", "Chains", HYBRID_VOTE_WEIGHTS.chains),
    getVoteData("PROJECT", "Apps", HYBRID_VOTE_WEIGHTS.apps),
    getVoteData("USER", "Users", HYBRID_VOTE_WEIGHTS.users),
  ];

  return (
    <Collapsible.Root
      open={isOpen}
      onOpenChange={setIsOpen}
      className="flex flex-col gap-1 last:mb-2 border border-line rounded-sm mb-[10px]"
    >
      <Collapsible.Trigger asChild>
        <div className="flex flex-col gap-1 p-3 cursor-pointer hover:bg-wash">
          <div className="flex justify-between font-semibold text-sm mb-1">
            <div className="whitespace-normal max-w-[12rem] text-primary text-xs font-bold flex items-center gap-2">
              {description}
            </div>
            <div className="text-primary flex items-center gap-1">
              <TokenAmountDecorated
                amount={votesFromAllCategories}
                hideCurrency
              />
              <span className="ml-1 text-tertiary">
                {weightedPercentage === 0
                  ? "0%"
                  : (weightedPercentage * 100).toFixed(2) + "%"}
              </span>
              <button className="w-4 h-4 flex items-center justify-center">
                <ExpandCollapseIcon className="stroke-primary" />
              </button>
            </div>
          </div>
          <ProgressBar
            barPercentage={barPercentage}
            isApproved={isApproved}
            thresholdPosition={thresholdPosition}
          />
        </div>
      </Collapsible.Trigger>

      <Collapsible.Content>
        <VotesGroupTable
          groups={voteGroups.map((group) => ({
            ...group,
            votes: group.votes || "0",
            percentage: `${Number(group.percentage).toFixed(0)}%`,
          }))}
          columns={[
            {
              key: "votes",
              header: "For",
              width: "w-[60px]",
              textColorClass: "text-positive",
            },
            {
              key: "percentage",
              header: "% vote",
              width: "w-[60px]",
            },
            {
              key: "weight",
              header: "% Weight",
              width: "w-[60px]",
            },
          ]}
          showBorder={true}
        />
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

export function ProgressBar({
  barPercentage,
  isApproved,
  thresholdPosition,
}: {
  barPercentage: bigint;
  isApproved: boolean;
  thresholdPosition: number;
}) {
  const progressBarWidth =
    Math.max(
      Number(barPercentage) / 100,
      Number(barPercentage) !== 0 ? 1 : 0
    ).toFixed(2) + "%";

  const progressBarColor = isApproved ? "bg-positive" : "bg-tertiary";

  return (
    <div className="flex">
      {" "}
      <div className="w-full h-3 rounded-1 bg-line relative mb-3">
        <div
          className={`h-3 absolute rounded-1 top-0 left-0 ${progressBarColor}`}
          style={{ width: progressBarWidth }}
        ></div>
        {!!thresholdPosition && (
          <div
            className={`w-[2px] h-4 absolute top-[-2px] rounded-1 bg-secondary`}
            style={{ right: `${thresholdPosition}%` }}
          ></div>
        )}
      </div>
    </div>
  );
}
