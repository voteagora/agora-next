import Image from "next/image";
import checkIcon from "@/icons/check.svg";
import linkIcon from "@/icons/link.svg";
import ProposalVotesBar from "../ProposalVotesBar/ProposalVotesBar";
import { Proposal } from "@/app/api/common/proposals/proposal";
import TokenAmountDecorated from "@/components/shared/TokenAmountDecorated";
import {
  isProposalCreatedBeforeUpgradeCheck,
  ParsedProposalResults,
} from "@/lib/proposalUtils";
import { format } from "date-fns";
import Link from "next/link";
import { StepperRow } from "@/components/common/StepperRow";

import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertTriangle, X } from "lucide-react";

export const QuorumTooltip = () => {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger className="ml-1">
          <AlertTriangle className="h-4 w-4 text-negative" />
        </TooltipTrigger>
        <TooltipContent className="text-primary text-xs max-w-xs font-semibold">
          <div className="flex flex-col gap-1">
            <AlertTriangle className="h-5 w-5 text-negative" />
            <span>
              Due to a governor upgrade on Jan 08, 2024, this quorum value is no
              longer valid. The onchain state of the proposal is unaffected
            </span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

type RangeProposalType = {
  min_quorum_pct: number;
  max_quorum_pct: number;
  min_approval_threshold_pct: number;
  max_approval_threshold_pct: number;
};

function AmountAndPercent({
  amount,
  total,
}: {
  amount: bigint;
  total: bigint;
}) {
  const percent =
    total > 0 ? ((Number(amount) / Number(total)) * 100).toFixed(2) : undefined;
  return (
    <span>
      <TokenAmountDecorated amount={amount} hideCurrency specialFormatting />
      {percent && `(${percent}%)`}
    </span>
  );
}

export default function ProposalVotesSummaryDetails({
  proposal,
}: {
  proposal: Proposal;
}) {
  const { token, namespace } = Tenant.current();
  const results =
    proposal.proposalResults as ParsedProposalResults["STANDARD"]["kind"];

  const formatTime = (date: Date | null) => {
    return format(new Date(date ?? ""), "h:mma MMMM dd yyyy");
  };

  let quorumVotes =
    BigInt(results.for) + BigInt(results.abstain) + BigInt(results.against);

  let totalVotes =
    BigInt(results.for) + BigInt(results.abstain) + BigInt(results.against);

  let thresholdVotes = BigInt(results.for) + BigInt(results.against);

  /**
   * This is a temporary fix for ENS.
   * https://voteagora.atlassian.net/browse/ENG-903
   * ENS does not count against votes in the quorum calculation.
   * This is a temporary fix stack for + abstain, but not against.
   * A future fix will read each tenant and stack depending on how the tenant counts quorum.
   */
  if (namespace === TENANT_NAMESPACES.ENS) {
    quorumVotes = quorumVotes - BigInt(results.against);
  }

  /**
   * Only FOR votes are counted towards quorum for Uniswap.
   */
  if (namespace === TENANT_NAMESPACES.UNISWAP) {
    quorumVotes = BigInt(results.for);
  }

  const voteThresholdPercent =
    Number(thresholdVotes) > 0
      ? (Number(results.for) / Number(thresholdVotes)) * 100
      : 0;
  const apprThresholdPercent = Number(proposal.approvalThreshold) / 100;

  const hasMetQuorum = Boolean(
    Number(quorumVotes) >= Number(proposal.quorum || 0)
  );

  const hasMetThreshold = Boolean(voteThresholdPercent >= apprThresholdPercent);

  const isProposalCreatedBeforeUpgrade =
    isProposalCreatedBeforeUpgradeCheck(proposal);

  // Check if this is an archive proposal with ranges (pending state)
  const archiveMetadata = (
    proposal as unknown as {
      archiveMetadata?: { source?: string; defaultProposalTypeRanges?: any };
    }
  ).archiveMetadata;

  const isDefeated = proposal.status === "Defeated";
  const isSuccessful = proposal.status === "Succeeded";
  const isActive = !isDefeated && !isSuccessful;

  const defaultProposalTypeRanges =
    isActive && archiveMetadata?.source === "eas-oodao"
      ? (archiveMetadata.defaultProposalTypeRanges as
          | RangeProposalType
          | undefined)
      : null;

  const hasPendingRanges = !!defaultProposalTypeRanges;

  const minQuorum = defaultProposalTypeRanges
    ? defaultProposalTypeRanges.min_quorum_pct / 100
    : null;
  const maxQuorum = defaultProposalTypeRanges
    ? defaultProposalTypeRanges.max_quorum_pct / 100
    : null;

  const minApprovalThreshold = defaultProposalTypeRanges
    ? defaultProposalTypeRanges.min_approval_threshold_pct / 100
    : null;
  const maxApprovalThreshold = defaultProposalTypeRanges
    ? defaultProposalTypeRanges.max_approval_threshold_pct / 100
    : null;

  return (
    <div className="flex flex-col font-inter font-semibold text-xs w-full max-w-[317px] sm:min-w-[317px] bg-wash">
      <ProposalVotesBar proposal={proposal} />

      <div className="flex flex-col gap-2 w-full mt-4">
        <div className="flex justify-between text-positive">
          FOR <AmountAndPercent amount={results.for} total={totalVotes} />
        </div>
        <div className="text-secondary flex justify-between">
          ABSTAIN{" "}
          <AmountAndPercent amount={results.abstain} total={totalVotes} />
        </div>
        <div className="text-negative flex justify-between">
          AGAINST{" "}
          <AmountAndPercent amount={results.against} total={totalVotes} />
        </div>
      </div>

      <div className="flex flex-col gap-2 w-[calc(100%+32px)] mt-2 bg-wash border-t border-b border-line -ml-4 p-4">
        {!!proposal.proposalTypeData?.name && (
          <div className="flex justify-between text-secondary font-semibold text-xs">
            Proposal Type
            <span>{proposal.proposalTypeData.name}</span>
          </div>
        )}
        <div className="flex justify-between">
          <div className="flex items-center gap-1 text-secondary font-semibold text-xs">
            Quorum
            {isProposalCreatedBeforeUpgrade && <QuorumTooltip />}
          </div>
          {hasPendingRanges ? (
            <div className="flex items-center gap-1">
              <p className="text-xs font-semibold text-secondary">
                {minQuorum}% – {maxQuorum}% Required
              </p>
            </div>
          ) : (
            proposal.quorum && (
              <div className="flex items-center gap-1 ">
                {hasMetQuorum && (
                  <Image
                    width="12"
                    height="12"
                    src={checkIcon}
                    alt="check icon"
                  />
                )}
                <p className="text-xs font-semibold text-secondary">
                  <TokenAmountDecorated
                    amount={quorumVotes}
                    decimals={token.decimals}
                    hideCurrency
                    specialFormatting
                  />{" "}
                  /{" "}
                  <TokenAmountDecorated
                    amount={proposal.quorum}
                    decimals={token.decimals}
                    hideCurrency
                    specialFormatting
                  />
                  {isProposalCreatedBeforeUpgrade && "0"} Required
                </p>
              </div>
            )
          )}
        </div>
        {hasPendingRanges ? (
          <div className="flex justify-between">
            <div className="flex flex-row gap-1 text-secondary font-semibold text-xs">
              Threshold
            </div>
            <div className="flex flex-row gap-1">
              <p className="text-xs font-semibold text-secondary">
                {minApprovalThreshold}% – {maxApprovalThreshold}% Required
              </p>
            </div>
          </div>
        ) : (
          proposal.approvalThreshold && (
            <div className="flex justify-between">
              <div className="flex flex-row gap-1 text-secondary font-semibold text-xs">
                Threshold
              </div>
              <div className="flex flex-row gap-1 ">
                {hasMetThreshold ? (
                  <Image src={checkIcon} alt="check icon" />
                ) : (
                  <X className="h-4 w-4 text-negative" />
                )}
                <p className=" text-xs font-semibold text-secondary">
                  {voteThresholdPercent.toFixed(2)}% /{" "}
                  {`${apprThresholdPercent}%`} Required
                </p>
              </div>
            </div>
          )
        )}
      </div>
      <ol className="overflow-hidden space-y-6 w-[calc(100%+32px)] bg-wash -ml-4 p-4 pb-6 rounded-br-lg rounded-bl-lg">
        <StepperRow
          label="Proposal created"
          value={formatTime(proposal.createdTime)}
        />
        <StepperRow
          label="Voting period start"
          value={formatTime(proposal.startTime)}
        />
        <StepperRow
          label="Voting period end"
          value={formatTime(proposal.endTime)}
        />
        <StepperRow
          isLastStep
          label={`Proposal ${proposal.status?.toLocaleLowerCase()}`}
          value={
            proposal.status === "EXECUTED"
              ? formatTime(proposal.executedTime)
              : formatTime(proposal.endTime)
          }
        />
      </ol>
    </div>
  );
}
