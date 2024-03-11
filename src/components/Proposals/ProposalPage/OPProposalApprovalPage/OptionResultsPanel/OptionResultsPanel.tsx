import { HStack, VStack } from "@/components/Layout/Stack";
import styles from "./optionResultsPanel.module.scss";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { ParsedProposalData, ParsedProposalResults } from "@/lib/proposalUtils";
import { parseUnits } from "viem";
import { tokenForContractAddress } from "@/lib/tokenUtils";
import Tenant from "@/lib/tenant/tenant";

export default function OptionsResultsPanel({
  proposal,
}: {
  proposal: Proposal;
}) {
  // Note: Defaulting to optimism token for now since the contract-scoped token
  // was exactly the same as the optimism token.

  const { contracts } = Tenant.getInstance();
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
    BigInt(proposalResults.for) + BigInt(proposalResults.abstain);

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
    <VStack className={styles.approval_choices_container}>
      {sortedOptions.map((option, index) => {
        let isApproved = false;
        const votesAmountBN = BigInt(option?.votes || 0);

        const optionBudget =
          (proposal?.created_time as Date) >
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
    </VStack>
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
    <VStack gap={1} className={styles.singleOptionContainer}>
      {" "}
      <HStack
        justifyContent="justify-between"
        className={styles.singleOptionHStack}
      >
        <div className={styles.descriptionText}>{description}</div>
        <div className={styles.votesText}>
          <TokenAmountDisplay amount={votes} decimals={18} currency="OP" />
          <span className={styles.votesMargin}>
            {percentage === 0n
              ? "(0%)"
              : "(" + Math.round(Number(percentage) / 100).toString() + "%)"}
          </span>
        </div>
      </HStack>
      <ProgressBar
        barPercentage={barPercentage}
        isApproved={isApproved}
        thresholdPosition={thresholdPosition}
      />
    </VStack>
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

  const progressBarColor = isApproved ? "bg-green-positive" : "bg-gray-4f";

  return (
    <HStack>
      {" "}
      <div className={`${styles.progressBarContainer}`}>
        <div
          className={`${styles.progressBar} ${progressBarColor}`}
          style={{ width: progressBarWidth }}
        ></div>
        {!!thresholdPosition && (
          <div
            className={`${styles.thresholdIndicator} bg-gray-4f`}
            style={{ right: `${thresholdPosition}%` }}
          ></div>
        )}
      </div>
    </HStack>
  );
}

function getScaledBarPercentage({
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
