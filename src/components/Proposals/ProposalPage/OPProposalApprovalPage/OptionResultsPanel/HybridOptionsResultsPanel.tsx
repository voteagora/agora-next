import { Proposal } from "@/app/api/common/proposals/proposal";
import {
  ParsedProposalData,
  calculateHybridApprovalMetrics,
} from "@/lib/proposalUtils";
import { formatNumber } from "@/lib/utils";
import Tenant from "@/lib/tenant/tenant";
import { cn } from "@/lib/utils";
import * as Collapsible from "@radix-ui/react-collapsible";
import { useState } from "react";
import { ExpandCollapseIcon } from "@/icons/ExpandCollapseIcon";
import VotesGroupTable from "@/components/common/VotesGroupTable";
import { HYBRID_VOTE_WEIGHTS } from "@/lib/constants";

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

  const proposalResults = proposal.proposalResults as unknown as {
    options: { option: string; votes: bigint }[];
    APP: Record<string, bigint>;
    USER: Record<string, bigint>;
    CHAIN: Record<string, bigint>;
    DELEGATES?: Record<string, bigint>;
    criteria: "THRESHOLD" | "TOP_CHOICES";
    criteriaValue: bigint;
    for?: bigint;
    against?: bigint;
    abstain?: bigint;
  };

  // Use consolidated function to calculate all metrics and approval data
  const hybridMetrics = calculateHybridApprovalMetrics(
    proposal,
    true // Include option approval data
  );

  // Extract data for threshold calculations
  const proposalSettings = proposalData.proposalSettings;
  const moduleCriteriaValue = BigInt(
    proposalResults?.criteriaValue ||
      proposalData.proposalSettings.criteriaValue ||
      0
  );

  const moduleThresholdPosition = (() => {
    if (proposalSettings.criteria === "THRESHOLD") {
      const thresholdPercentage = Number(moduleCriteriaValue) / 10000;
      return thresholdPercentage;
    }
    return 0;
  })();

  const { optionsWithApproval } = hybridMetrics;

  const sortedOptions = [...(optionsWithApproval || [])].sort((a, b) => {
    if (a.weightedPercentage !== b.weightedPercentage) {
      return b.weightedPercentage - a.weightedPercentage;
    }

    return b.rawVotes > a.rawVotes ? 1 : b.rawVotes < a.rawVotes ? -1 : 0;
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
          return (
            <SingleOption
              key={index}
              description={option.option}
              thresholdPosition={moduleThresholdPosition}
              isApproved={option.isApproved}
              option={option}
              proposalResults={proposalResults}
              weightedPercentage={option.weightedPercentage}
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
  thresholdPosition,
  isApproved,
  option,
  proposalResults,
  weightedPercentage,
}: {
  description: string;
  thresholdPosition: number;
  isApproved: boolean;
  option: any;
  proposalResults: any;
  weightedPercentage: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const weightedDisplayPercentage = weightedPercentage * 100;

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
      votes:
        category === "DELEGATES" ? formatNumber(votes, token.decimals) : votes,
      percentage: weightedDisplayPercentage,
      weight: (weight * 100).toFixed(2),
    };
  };

  const voteGroups = [
    getVoteData("DELEGATES", "Delegates", HYBRID_VOTE_WEIGHTS.delegates),
    getVoteData("CHAIN", "Chains", HYBRID_VOTE_WEIGHTS.chains),
    getVoteData("APP", "Apps", HYBRID_VOTE_WEIGHTS.apps),
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
            barPercentage={weightedDisplayPercentage}
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
            percentage: `${Number(group.percentage).toFixed(2)}%`,
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
  barPercentage: number;
  isApproved: boolean;
  thresholdPosition: number;
}) {
  const progressBarWidth =
    Math.max(
      Number(barPercentage),
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
