import TokenAmountDecorated from "@/components/shared/TokenAmountDecorated";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { ParsedProposalData, ParsedProposalResults } from "@/lib/proposalUtils";
import { parseUnits } from "viem";
import { tokenForContractAddress } from "@/lib/tokenUtils";
import Tenant from "@/lib/tenant/tenant";
import { cn } from "@/lib/utils";
import { fontMapper } from "@/styles/fonts";
import Markdown from "@/components/shared/Markdown/Markdown";

const { contracts, ui } = Tenant.current();

export default function OptionsResultsPanel({
  proposal,
  className,
  optionsToShow = 5,
  showAllOptions = true,
  overrideOptions,
}: {
  proposal: Proposal;
  className?: string;
  optionsToShow?: number;
  showAllOptions?: boolean;
  overrideOptions?: {
    description: string;
    votes: string;
    votesAmountBN: string;
    totalVotingPower: string;
    proposalSettings: any;
    thresholdPosition: number;
    isApproved: boolean;
  }[];
}) {
  // Note: Defaulting to optimism token for now since the contract-scoped token
  // was exactly the same as the optimism token.

  const proposalData =
    proposal.proposalData as ParsedProposalData["APPROVAL"]["kind"];

  const { decimals: contractTokenDecimals } = tokenForContractAddress(
    proposalData.proposalSettings.budgetToken
  );

  const proposalResults =
    proposal.proposalResults as ParsedProposalResults["APPROVAL"]["kind"];
  const proposalSettings = proposalData.proposalSettings;
  const options = proposalResults.options;

  const totalVotingPower =
    BigInt(proposalResults.for) +
    BigInt(proposalResults.abstain) +
    BigInt(proposalResults.against);

  const thresholdPosition = (() => {
    if (proposalSettings.criteria === "THRESHOLD") {
      const threshold = BigInt(proposalSettings.criteriaValue);
      if (totalVotingPower < (threshold * BigInt(15)) / BigInt(10)) {
        return 66;
      } else {
        // calculate threshold position, min 5% max 66%
        return totalVotingPower
          ? Math.max(Number((threshold * BigInt(100)) / totalVotingPower), 5)
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
      return BigInt(b.votes || 0) > BigInt(a.votes || 0)
        ? 1
        : BigInt(b.votes || 0) < BigInt(a.votes || 0)
          ? -1
          : 0;
    });

  return (
    <div
      className={cn(
        "flex flex-col max-h-[calc(100vh-482px)] overflow-y-scroll flex-shrink px-4 min-h-[36px]",
        className
      )}
    >
      {overrideOptions
        ? overrideOptions
            .slice(0, showAllOptions ? overrideOptions.length : optionsToShow)
            .map((opt, index) => (
              <SingleOption
                key={index}
                description={opt.description}
                votes={BigInt(opt.votesAmountBN)}
                votesAmountBN={BigInt(opt.votesAmountBN)}
                totalVotingPower={BigInt(opt.totalVotingPower)}
                proposalSettings={opt.proposalSettings}
                thresholdPosition={opt.thresholdPosition}
                isApproved={opt.isApproved}
              />
            ))
        : sortedOptions
            .slice(0, showAllOptions ? sortedOptions.length : optionsToShow)
            .map((option, index) => {
              let isApproved = false;
              const votesAmountBN = BigInt(option?.votes || 0);

              const optionBudget =
                (proposal?.createdTime as Date) >
                contracts.governor.optionBudgetChangeDate!
                  ? BigInt(option?.budgetTokensSpent || 0)
                  : parseUnits(
                      option?.budgetTokensSpent?.toString() || "0",
                      contractTokenDecimals
                    );
              if (proposalSettings.criteria === "TOP_CHOICES") {
                isApproved = index < Number(proposalSettings.criteriaValue);
              } else if (proposalSettings.criteria === "THRESHOLD") {
                const threshold = BigInt(proposalSettings.criteriaValue);
                isApproved =
                  !isExceeded &&
                  votesAmountBN >= threshold &&
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
                  votes={option.votes}
                  votesAmountBN={votesAmountBN}
                  totalVotingPower={totalVotingPower}
                  proposalSettings={proposalSettings}
                  thresholdPosition={thresholdPosition}
                  isApproved={isApproved}
                />
              );
            })}
      {!showAllOptions &&
        (overrideOptions ? overrideOptions.length : sortedOptions.length) >
          optionsToShow && (
          <div className="flex justify-center items-center text-primary bg-wash rounded-lg p-2 w-24 ml-auto">
            +
            {(overrideOptions ? overrideOptions.length : sortedOptions.length) -
              optionsToShow}{" "}
            more
          </div>
        )}
    </div>
  );
}

function SingleOption({
  description,
  votes,
  votesAmountBN,
  totalVotingPower,
  proposalSettings,
  thresholdPosition,
  isApproved,
}: {
  description: string;
  votes: bigint;
  votesAmountBN: bigint;
  totalVotingPower: bigint;
  proposalSettings: any;
  thresholdPosition: number;
  isApproved: boolean;
}) {
  let barPercentage = BigInt(0);
  const percentage =
    totalVotingPower === 0n
      ? BigInt(0)
      : (votesAmountBN * BigInt(10000)) / totalVotingPower; // mul by 10_000 to get 2 decimal places, divide by 100 later to use percentage

  if (proposalSettings.criteria === "TOP_CHOICES") {
    barPercentage = percentage;
  } else if (proposalSettings.criteria === "THRESHOLD") {
    const threshold = BigInt(proposalSettings.criteriaValue);
    barPercentage = getScaledBarPercentage({
      threshold,
      totalVotingPower,
      votesAmountBN,
      thresholdPosition,
    });
  }

  return (
    <div className="flex flex-col gap-1 last:mb-2">
      {" "}
      <div className="flex justify-between font-semibold text-sm mb-1">
        <div className="whitespace-normal max-w-[12rem] text-primary">
          <Markdown content={description} />
        </div>
        <div className="text-primary flex items-center gap-1">
          <TokenAmountDecorated
            amount={votes}
            className={
              fontMapper[ui?.customization?.tokenAmountFont || ""]?.variable
            }
            specialFormatting
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
        </div>
      </div>
      <ProgressBar
        barPercentage={barPercentage}
        isApproved={isApproved}
        thresholdPosition={thresholdPosition}
      />
    </div>
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
      <div className="w-full h-[6px] rounded-[10px] bg-line relative mb-3">
        <div
          className={`h-[6px] absolute rounded-[10px] top-0 right-0 ${progressBarColor}`}
          style={{ width: progressBarWidth }}
        ></div>
        {!!thresholdPosition && (
          <div
            className={`w-[2px] h-[6px] absolute top-0 rounded-[10px] bg-secondary`}
            style={{ right: `${thresholdPosition}%` }}
          ></div>
        )}
      </div>
    </div>
  );
}

export function getScaledBarPercentage({
  threshold,
  totalVotingPower,
  votesAmountBN,
  thresholdPosition,
}: {
  threshold: bigint;
  totalVotingPower: bigint;
  votesAmountBN: bigint;
  thresholdPosition: number;
}) {
  if (!totalVotingPower) {
    return BigInt(0);
  } else if (totalVotingPower < (threshold * BigInt(15)) / BigInt(10)) {
    // here thresholdPosition is 66%
    return (
      (votesAmountBN * BigInt(10000)) / ((threshold * BigInt(15)) / BigInt(10))
    );
  }

  // here thresholdPosition is calculated based on threshold and totalVotingPower, min 5% max 66%
  const barPercentage = (votesAmountBN * BigInt(10000)) / totalVotingPower;

  // handle case where barPercentage is less than thresholdPosition but votesAmountBN is greater than threshold
  if (votesAmountBN >= threshold) {
    if (barPercentage / BigInt(100) <= BigInt(thresholdPosition)) {
      return BigInt(thresholdPosition * 100) + BigInt(100);
    }
  } else {
    // handle case where barPercentage is greater than thresholdPosition but votesAmountBN is less than threshold
    if (barPercentage / BigInt(100) >= BigInt(thresholdPosition)) {
      return BigInt(thresholdPosition * 100) - BigInt(100);
    }
  }

  return barPercentage;
}
