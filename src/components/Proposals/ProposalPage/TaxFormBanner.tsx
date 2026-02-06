"use client";

import { addDays, isPast, differenceInMilliseconds } from "date-fns";
import { Clock } from "lucide-react";
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
  extractPayeeFromMetadata,
  FORM_COMPLETED_KEY,
  normalizeBoolean,
  PAYEE_FORM_URL_KEY,
} from "@/lib/taxFormUtils";

const TAX_FORM_DEADLINE_DAYS = 15;

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
}: {
  deadline: Date | null;
  isExpired: boolean;
  now: Date;
}) {
  if (!deadline) return null;

  if (isExpired) {
    return (
      <div className="flex items-center gap-1.5 text-negative text-sm">
        <Clock className="w-3.5 h-3.5" />
        <span className="font-medium">Deadline passed</span>
      </div>
    );
  }

  const timeLeft = formatTimeLeft(deadline, now);
  if (!timeLeft) return null;

  const isUrgent = timeLeft.days < 3;
  const colorClass = isUrgent ? "text-negative" : "text-positive";

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

    return {
      hasPayeeKey,
      payeeAddress,
      currentUserIsPayee:
        hasPayeeKey && addressesMatch(payeeAddress, address ?? null),
      isFormCompleted,
      payeeFormUrl:
        (metadata[PAYEE_FORM_URL_KEY] as string | undefined) ??
        togglePayeeFormUrl,
    };
  }, [address, proposal.taxFormMetadata, togglePayeeFormUrl]);

  const isWaitingForPayment = proposal.status === PROPOSAL_STATUS.SUCCEEDED;
  const isSignedIn = Boolean(address);

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
  const requiresTaxForm =
    isEnabled &&
    isWaitingForPayment &&
    isOnchainProposal &&
    !isTempCheck &&
    !isFormCompleted;

  const {
    deadline,
    isExpired: isDeadlinePassed,
    now,
  } = useTaxFormDeadline(proposal.endTime, requiresTaxForm);

  // Skip when globally off or non-gov proposals
  if (!requiresTaxForm) {
    return null;
  }

  const bannerClass =
    "flex items-center justify-between gap-4 rounded-lg bg-neutral px-4 py-3 shadow-newDefault mb-6 min-h-[64px]";
  const contentClass = "flex items-center gap-2 flex-1";

  // Pre-login: show generic banner only if a payee_recipient is set
  if (!isSignedIn) {
    if (!hasPayeeKey) {
      return null;
    }
    return (
      <div className={bannerClass}>
        <div className={contentClass}>
          <div className="bg-wash rounded-md p-1.5 text-tertiary">
            <CheckCircleBrokenIcon className="w-4 h-4" stroke="currentColor" />
          </div>
          <p className="text-secondary text-sm md:text-sm">
            This proposal has passed. If you are the payee, please sign in to
            complete your payment information.
          </p>
        </div>
      </div>
    );
  }

  // Post-login: only show for the designated payee with a known address
  if (!hasPayeeKey || !payeeAddress || !currentUserIsPayee) {
    return null;
  }

  return (
    <div className={bannerClass}>
      <div className={contentClass}>
        <div className="bg-wash rounded-md p-1.5 text-tertiary">
          <CheckCircleBrokenIcon className="w-4 h-4" stroke="currentColor" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-secondary text-sm md:text-sm">
            You&apos;re almost ready to receive the funds from this proposal.
            Please complete your payment information to proceed.
          </p>
          <CountdownTimer
            deadline={deadline}
            isExpired={isDeadlinePassed}
            now={now}
          />
        </div>
      </div>
      {payeeFormUrl ? (
        <UpdatedButton
          href={isDeadlinePassed ? undefined : payeeFormUrl}
          type="primary"
          className={
            isDeadlinePassed
              ? "opacity-50 cursor-not-allowed pointer-events-none"
              : undefined
          }
          target="_blank"
          rel="noreferrer"
          aria-disabled={isDeadlinePassed}
        >
          Complete payee form
        </UpdatedButton>
      ) : null}
    </div>
  );
}
