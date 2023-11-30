import { HStack, VStack } from "@/components/Layout/Stack";
import styles from "./optionResultsPanel.module.scss";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import { css } from "@emotion/css";
import * as theme from "@/styles/theme";

export default function OptionsResultsPanel({ proposal }) {
  const status = proposal.status;

  const totalVotingPower =
    BigInt(proposal.proposalResults.for) +
    BigInt(proposal.proposalResults.abstain);

  let thresholdPosition = 0;

  if (proposal.proposalResults.criteria === "THRESHOLD") {
    const threshold = BigInt(proposal.proposalResults.criteriaValue);
    if (totalVotingPower.lt(threshold.mul(15).div(10))) {
      thresholdPosition = 66;
    } else {
      // calculate threshold position, min 5% max 66%
      thresholdPosition = Math.max(
        threshold.mul(100).div(totalVotingPower).toNumber(),
        5
      );
    }
  }

  let availableBudget = BigInt(
    proposal.proposalData.proposalSettings.budgetAmount
  );

  return (
    <VStack className={styles.approval_choices_container}>
      {proposal.proposalResults.options.map((option, index) => {
        console.log(option);
        let isApproved = false;
        const votesAmountBN = BigInt(option.votes.votes);
        const optionBudget = BigInt(
          proposal.proposalData.proposalSettings.budgetAmount
        );
        if (proposal.proposalData.proposalSettings.criteria === "TOP_CHOICES") {
          isApproved =
            index < proposal.proposalData.proposalSettings.maxApprovals;
        } else if (
          proposal.proposalData.proposalSettings.criteria === "THRESHOLD"
        ) {
          const threshold = BigInt(settings.criteria.threshold.amount);
          isApproved =
            votesAmountBN.gte(threshold) && availableBudget.gte(optionBudget);
          if (isApproved) availableBudget = availableBudget.sub(optionBudget);
        }
        return (
          <SingleOption
            key={index}
            description={option.option}
            votes={option.votes}
            votesAmountBN={votesAmountBN}
            totalVotingPower={totalVotingPower}
            status={status}
            proposalSettings={proposal.proposalData.proposalSettings}
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
  status,
  proposalSettings,
  thresholdPosition,
  isApproved,
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
    <div>
      <HStack
        className={css`
          justify-content: space-between;
          font-weight: ${theme.fontWeight.medium};
          font-size: ${theme.fontSize.sm};
          margin-bottom: ${theme.spacing["1"]};
        `}
      >
        <div
          className={css`
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            max-width: ${theme.spacing["48"]};
          `}
        >
          {description}
        </div>
        <div
          className={css`
            color: ${theme.colors.gray[700]};
          `}
        >
          {votes.votes}
          <span
            className={css`
              margin-left: ${theme.spacing["1"]};
            `}
          >
            {percentage === 0n
              ? "(0%)"
              : "(" + Math.round(Number(percentage) / 100).toString() + "%)"}
          </span>
        </div>
      </HStack>
      <ProgressBar
        barPercentage={barPercentage}
        status={status}
        isApproved={isApproved}
        thresholdPosition={thresholdPosition}
      />
    </div>
  );
}

export function ProgressBar({
  barPercentage,
  status,
  isApproved,
  thresholdPosition,
}) {
  return (
    <HStack>
      <div
        className={css`
          width: 100%;
          height: 6px;
          border-radius: 10px;
          background-color: ${theme.colors.gray.eo};
          position: relative;
          margin-bottom: ${theme.spacing["3"]};
        `}
      >
        <div
          className={css`
            width: ${Math.max(
              Number(barPercentage) / 100,
              Number(barPercentage) !== 0 ? 1 : 0
            )
              .toFixed(2)
              .toString()}%;
            height: 6px;
            background-color: ${isApproved
              ? status === "EXECUTED" || status === "SUCCEEDED"
                ? theme.colors.green.positive
                : theme.colors.green.positive
              : theme.colors.gray["4f"]};
            position: absolute;
            border-radius: 10px;
            top: 0;
            right: 0;
          `}
        ></div>
        {!!thresholdPosition && (
          <div
            className={css`
              width: 2px;
              height: 6px;
              background-color: ${theme.colors.gray["4f"]};
              position: absolute;
              border-radius: 10px;
              top: 0;
              right: ${thresholdPosition}%;
            `}
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
}) {
  let barPercentage = BigInt(0);

  if (totalVotingPower === 0n) {
    barPercentage = BigInt(0);
  } else if (totalVotingPower < (threshold * BigInt(15)) / BigInt(10)) {
    // here thresholdPosition is 66%
    barPercentage =
      (votesAmountBN * BigInt(10000)) / ((threshold * BigInt(15)) / BigInt(10));
  } else if (totalVotingPower >= (threshold * BigInt(15)) / BigInt(10)) {
    // here thresholdPosition is calculated based on threshold and totalVotingPower, min 5% max 66%
    barPercentage = (votesAmountBN * BigInt(10000)) / totalVotingPower;

    // handle case where barPercentage is less than thresholdPosition but votesAmountBN is greater than threshold
    if (votesAmountBN >= threshold) {
      if (barPercentage / BigInt(100) <= BigInt(thresholdPosition)) {
        barPercentage = BigInt(thresholdPosition * 100) + BigInt(100);
      }
    } else {
      // handle case where barPercentage is greater than thresholdPosition but votesAmountBN is less than threshold
      if (barPercentage / BigInt(100) >= BigInt(thresholdPosition)) {
        barPercentage = BigInt(thresholdPosition * 100) - BigInt(100);
      }
    }
  }

  return barPercentage;
}
