import TokenAmountDecorated from "@/components/shared/TokenAmountDecorated";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { ParsedProposalData } from "@/lib/proposalUtils";
import { parseUnits } from "viem";
import { formatNumber } from "@/lib/utils";
import { tokenForContractAddress } from "@/lib/tokenUtils";
import Tenant from "@/lib/tenant/tenant";
import { cn } from "@/lib/utils";
import { fontMapper } from "@/styles/fonts";
import * as Collapsible from "@radix-ui/react-collapsible";
import { useState } from "react";
import { ExpandCollapseIcon } from "@/icons/ExpandCollapseIcon";
import VotesGroupTable from "@/components/common/VotesGroupTable";
import { getScaledBarPercentage } from "./OptionResultsPanel";

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
  console.log("proposalResults", proposalResults);

  const proposalSettings = proposalData.proposalSettings;
  const options = proposalResults.options;

  // Helper function to calculate votes for an option
  const calculateOptionVotes = (optionName: string) => {
    let optionVotes = 0n;
    if (proposalResults.DELEGATES?.[optionName]) {
      optionVotes += BigInt(proposalResults.DELEGATES[optionName]);
    }
    if (proposalResults.CHAIN[optionName]) {
      optionVotes += BigInt(proposalResults.CHAIN[optionName]);
    }
    if (proposalResults.PROJECT[optionName]) {
      optionVotes += BigInt(proposalResults.PROJECT[optionName]);
    }
    if (proposalResults.USER[optionName]) {
      optionVotes += BigInt(proposalResults.USER[optionName]);
    }
    return optionVotes;
  };

  // Calculate total voting power across all options and categories
  let totalVotingPower = 0n;
  for (const option of options) {
    totalVotingPower += calculateOptionVotes(option.option);
  }

  const thresholdPosition = (() => {
    if (proposalSettings.criteria === "THRESHOLD") {
      const threshold = BigInt(criteriaValue);
      if (totalVotingPower < (threshold * BigInt(15)) / BigInt(10)) {
        return 66;
      } else {
        // calculate threshold position, min 5% max 66%
        return totalVotingPower > 0n
          ? Math.max(Number((threshold * BigInt(100)) / totalVotingPower), 5)
          : 5;
      }
    }
    return 0;
  })();

  //   let availableBudget = BigInt(proposalSettings.budgetAmount);
  let availableBudget = BigInt(100000000);
  let isExceeded = false;

  const mutableOptions = [...options];
  const sortedOptions = mutableOptions
    .map((option, i) => {
      return { ...option, ...proposalData.options[i] };
    })
    .sort((a, b) => {
      const aVotes = calculateOptionVotes(a.option);
      const bVotes = calculateOptionVotes(b.option);
      return bVotes > aVotes ? 1 : bVotes < aVotes ? -1 : 0;
    });

  return (
    <div
      className={cn(
        "flex flex-col max-h-[calc(100vh-482px)] overflow-y-auto flex-shrink p-4 min-h-[36px] mb-[192px]",
        className
      )}
    >
      {sortedOptions
        .slice(0, showAllOptions ? sortedOptions.length : optionsToShow)
        .map((option, index) => {
          let isApproved = false;

          const votesFromAllCategories = calculateOptionVotes(option.option);

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
            const threshold = BigInt(criteriaValue);
            isApproved =
              !isExceeded &&
              votesFromAllCategories >= threshold &&
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
              totalVotingPower={totalVotingPower}
              proposalSettings={proposalSettings}
              thresholdPosition={thresholdPosition}
              isApproved={isApproved}
              option={option}
              proposalResults={proposalResults}
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
  totalVotingPower,
  proposalSettings,
  thresholdPosition,
  isApproved,
  option,
  proposalResults,
}: {
  description: string;
  votesFromAllCategories: bigint;
  totalVotingPower: bigint;
  proposalSettings: any;
  thresholdPosition: number;
  isApproved: boolean;
  option: any;
  proposalResults: any;
}) {
  const criteriaValue = BigInt(100);

  const [isOpen, setIsOpen] = useState(false);
  let barPercentage = BigInt(0);
  const percentage =
    totalVotingPower === 0n
      ? BigInt(0)
      : (votesFromAllCategories * BigInt(10000)) / totalVotingPower; // mul by 10_000 to get 2 decimal places, divide by 100 later to use percentage

  if (proposalSettings.criteria === "TOP_CHOICES") {
    barPercentage = percentage;
  } else if (proposalSettings.criteria === "THRESHOLD") {
    const threshold = BigInt(criteriaValue);
    barPercentage = getScaledBarPercentage({
      threshold,
      totalVotingPower,
      votesAmountBN: votesFromAllCategories,
      thresholdPosition,
    });
  }

  // Calculate vote data for each category
  const { token } = Tenant.current();
  const getVoteData = (
    category: string,
    displayName: string,
    weight: string
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
      weight,
    };
  };

  const voteGroups = [
    getVoteData("DELEGATES", "Delegates", "50.00%"),
    getVoteData("CHAIN", "Chains", "16.67%"),
    getVoteData("PROJECT", "Apps", "16.67%"),
    getVoteData("USER", "Users", "16.67%"),
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
                className={
                  fontMapper[ui?.customization?.tokenAmountFont || ""]?.variable
                }
                hideCurrency
              />
              <span
                className={cn(
                  "ml-1 text-tertiary",
                  fontMapper[ui?.customization?.tokenAmountFont || ""]?.variable
                )}
              >
                {percentage === 0n
                  ? "0%"
                  : (Number(percentage) / 100).toFixed(2) + "%"}
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
