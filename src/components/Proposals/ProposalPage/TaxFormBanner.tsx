"use client";

import { addDays, isPast, differenceInMilliseconds } from "date-fns";
import { CheckCircle, Clock, ExternalLink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { UpdatedButton } from "@/components/Button";
import { CheckCircleBrokenIcon } from "@/icons/CheckCircleBrokenIcon";
import { PROPOSAL_STATUS } from "@/lib/constants";
import Tenant from "@/lib/tenant/tenant";
import {
  addressesMatch,
  COWRIE_VERIFICATION_COMPLETED_KEY,
  EXECUTION_TRANSACTIONS_KEY,
  extractPayeeFromMetadata,
  FORM_COMPLETED_KEY,
  getExplorerTxUrl,
  normalizeBoolean,
  PAYEE_FORM_URL_KEY,
} from "@/lib/taxFormUtils";

const TAX_FORM_DEADLINE_DAYS = 15;

type ExecutionTransaction = {
  id: string;
  transaction_hash: string;
  chain_id: number;
  executed_by: string;
  executed_at: string;
};

function useTaxFormDeadline(endTime: Date | null, enabled: boolean) {
  const deadline = useMemo(() => {
    if (!endTime) return null;
    return addDays(new Date(endTime), TAX_FORM_DEADLINE_DAYS);
  }, [endTime]);

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!enabled || !deadline) return;

    // Refresh immediately when enabled changes (e.g. user signs in)
    setNow(new Date());

    if (isPast(deadline)) return;

    // Update once per minute since UI only shows days/hours/minutes.
    const minuteTimer = setInterval(() => setNow(new Date()), 60000);

    // Also schedule a one-off update right at the deadline so the button disables promptly.
    const msUntilDeadline = deadline.getTime() - Date.now();
    const expiryTimer =
      msUntilDeadline > 0
        ? setTimeout(() => setNow(new Date()), msUntilDeadline)
        : undefined;

    return () => {
      clearInterval(minuteTimer);
      if (expiryTimer) clearTimeout(expiryTimer);
    };
  }, [deadline, enabled]);

  const isExpired = deadline ? isPast(deadline) : false;

  return { deadline, isExpired, now };
}

function formatTimeLeft(deadline: Date, now: Date) {
  const diff = differenceInMilliseconds(deadline, now);
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes };
}

function CountdownTimer({
  deadline,
  isExpired,
  now,
  compact = false,
}: {
  deadline: Date | null;
  isExpired: boolean;
  now: Date;
  compact?: boolean;
}) {
  if (!deadline) return null;

  if (isExpired) {
    if (compact) {
      return <span className="text-negative font-medium">Passed</span>;
    }
    return (
      <div className="flex items-center gap-1.5 text-negative text-sm">
        <span className="font-medium">Deadline passed</span>
      </div>
    );
  }

  const timeLeft = formatTimeLeft(deadline, now);
  if (!timeLeft) return null;

  const isUrgent = timeLeft.days < 3;
  const colorClass = isUrgent ? "text-negative" : "text-positive";

  if (compact) {
    return (
      <span className={`tabular-nums font-medium ${colorClass}`}>
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {String(timeLeft.hours).padStart(2, "0")}h{" "}
        {String(timeLeft.minutes).padStart(2, "0")}m
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 text-sm ${colorClass}`}>
      <Clock className="w-3.5 h-3.5" />
      <span className="tabular-nums font-medium">
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {String(timeLeft.hours).padStart(2, "0")}h{" "}
        {String(timeLeft.minutes).padStart(2, "0")}m
      </span>
      <span className="font-normal">left to complete form</span>
    </div>
  );
}

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

type Props = {
  proposal: Proposal;
};

export function TaxFormBanner({ proposal }: Props) {
  const { address } = useAccount();
  const { ui } = Tenant.current();
  const taxFormToggle = ui.toggle("tax-form") ?? ui.toggle("tax-form-banner");
  const isEnabled = taxFormToggle?.enabled ?? false;
  const togglePayeeFormUrl = (
    taxFormToggle?.config as
      | { payeeFormUrl?: string; provider?: string }
      | undefined
  )?.payeeFormUrl;

  const {
    hasPayeeKey,
    payeeAddress,
    currentUserIsPayee,
    isFormCompleted,
    payeeFormUrl,
    executionTransactions,
  } = useMemo(() => {
    const metadata = proposal.taxFormMetadata ?? {};
    const { hasPayeeKey, payeeAddress } = extractPayeeFromMetadata(metadata);
    const hasCowrieStatus = Object.prototype.hasOwnProperty.call(
      metadata,
      COWRIE_VERIFICATION_COMPLETED_KEY
    );
    const isCowrieComplete = normalizeBoolean(
      metadata[COWRIE_VERIFICATION_COMPLETED_KEY]
    );
    const isFormCompleted = hasCowrieStatus
      ? isCowrieComplete
      : normalizeBoolean(metadata[FORM_COMPLETED_KEY]);

    const executionTransactions = (metadata[EXECUTION_TRANSACTIONS_KEY] ??
      []) as ExecutionTransaction[];

    return {
      hasPayeeKey,
      payeeAddress,
      currentUserIsPayee:
        hasPayeeKey && addressesMatch(payeeAddress, address ?? null),
      isFormCompleted,
      payeeFormUrl:
        (metadata[PAYEE_FORM_URL_KEY] as string | undefined) ??
        togglePayeeFormUrl,
      executionTransactions,
    };
  }, [address, proposal.taxFormMetadata, togglePayeeFormUrl]);

  const isWaitingForPayment = proposal.status === PROPOSAL_STATUS.SUCCEEDED;
  const isSignedIn = Boolean(address);
  const hasPaymentBeenMade = executionTransactions.length > 0;

  // Check if this is an onchain governance proposal (not a temp check)
  // Can be identified by tag or by proposal type
  const rawTag =
    proposal.archiveMetadata?.rawTag ??
    (Array.isArray((proposal as unknown as { tags?: string[] }).tags)
      ? (proposal as unknown as { tags?: string[] }).tags?.[0]
      : undefined);
  const normalizedTag = rawTag?.toLowerCase();

  // Temp checks should never show the tax form banner, even if they have onchain types
  const isTempCheck =
    normalizedTag === "tempcheck" || normalizedTag === "temp-check";

  const hasGovTag =
    normalizedTag === "gov-proposal" || normalizedTag === "govproposal";

  const onchainProposalTypes = ["STANDARD", "APPROVAL", "OPTIMISTIC"];
  const hasOnchainType = proposal.proposalType
    ? onchainProposalTypes.includes(proposal.proposalType)
    : false;

  const isOnchainProposal = hasGovTag || hasOnchainType;

  // Show banner if: enabled, succeeded proposal, onchain, not temp check, has payee set
  const shouldShowBanner =
    isEnabled &&
    isWaitingForPayment &&
    isOnchainProposal &&
    !isTempCheck &&
    hasPayeeKey;

  const {
    deadline,
    isExpired: isDeadlinePassed,
    now,
  } = useTaxFormDeadline(proposal.endTime, shouldShowBanner);

  // Hide banner if basic conditions not met
  if (!shouldShowBanner) {
    return null;
  }

  // Only show the payee-specific CTA to the payee themselves
  const showPayeeCTA =
    isSignedIn && currentUserIsPayee && !isFormCompleted && !isDeadlinePassed;
  const showSignInPrompt = !isSignedIn && !isFormCompleted && !isDeadlinePassed;

  const hasSecondRow = showSignInPrompt || showPayeeCTA;

  return (
    <>
      <div className="rounded-lg bg-neutral px-4 py-3 shadow-newDefault mb-6">
        <div
          className={`flex gap-6 text-sm ${hasSecondRow ? "items-start" : "items-center"}`}
        >
          {/* Left: Icon + Title */}
          <div
            className={`flex items-center gap-2 shrink-0 ${hasSecondRow ? "pt-0.5" : ""}`}
          >
            <div className="bg-wash rounded-md p-1.5 text-tertiary">
              <CheckCircleBrokenIcon
                className="w-4 h-4"
                stroke="currentColor"
              />
            </div>
            <span className="font-semibold text-primary">Payment Status</span>
          </div>

          {/* Right: Content stacked vertically */}
          <div className="flex flex-col gap-2">
            {/* Top row: Status items */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Payee */}
              {payeeAddress && (
                <>
                  <span>
                    <span className="font-medium text-primary">Payee:</span>{" "}
                    <span className="font-mono text-secondary">
                      {payeeAddress}
                    </span>
                  </span>
                  <span className="text-line">·</span>
                </>
              )}

              {/* Deadline */}
              <span>
                <span className="font-medium text-primary">Deadline:</span>{" "}
                <CountdownTimer
                  deadline={deadline}
                  isExpired={isDeadlinePassed}
                  now={now}
                  compact
                />
              </span>

              <span className="text-line">·</span>

              {/* Tax Form */}
              <span>
                <span className="font-medium text-primary">Tax Form:</span>{" "}
                {isFormCompleted ? (
                  <span className="text-positive inline-flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Done
                  </span>
                ) : (
                  <span className="text-secondary">Pending</span>
                )}
              </span>

              <span className="text-line">·</span>

              {/* Payment */}
              <span>
                <span className="font-medium text-primary">Payment:</span>{" "}
                {hasPaymentBeenMade ? (
                  <a
                    href={getExplorerTxUrl(
                      executionTransactions[0].chain_id,
                      executionTransactions[0].transaction_hash
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="text-positive inline-flex items-center gap-1 hover:underline"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Paid
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-secondary">Pending</span>
                )}
              </span>
            </div>

            {/* Bottom row: Payee CTA text or Sign-in prompt */}
            {showPayeeCTA && (
              <p className="text-secondary">
                You&apos;re almost ready to receive the funds from this
                proposal. Please complete your payment information to proceed.
              </p>
            )}

            {showSignInPrompt && (
              <p className="text-secondary">
                This proposal has passed. If you are the payee, please sign in
                to complete your payment information.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Full-width CTA button below banner */}
      {showPayeeCTA && payeeFormUrl && (
        <UpdatedButton
          href={payeeFormUrl}
          type="primary"
          target="_blank"
          rel="noreferrer"
          className="w-full rounded-lg mb-6 text-sm flex items-center justify-center"
        >
          Complete Payee Form →
        </UpdatedButton>
      )}
    </>
  );
}
