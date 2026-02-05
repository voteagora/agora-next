"use client";

import { useMemo, useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { PROPOSAL_STATUS } from "@/lib/constants";
import { UpdatedButton } from "@/components/Button";
import { CheckCircleBrokenIcon } from "@/icons/CheckCircleBrokenIcon";
import Tenant from "@/lib/tenant/tenant";
import {
  addressesMatch,
  COWRIE_VERIFICATION_COMPLETED_KEY,
  extractPayeeFromMetadata,
  FORM_COMPLETED_KEY,
  normalizeBoolean,
  PAYEE_FORM_URL_KEY,
} from "@/lib/taxFormUtils";
import { Clock } from "lucide-react";

const TAX_FORM_DEADLINE_DAYS = 15;

function useCountdown(endTime: Date | null) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  } | null>(null);

  useEffect(() => {
    if (!endTime) {
      setTimeLeft(null);
      return;
    }

    // Calculate deadline: 15 days from proposal end time
    const deadline = new Date(endTime);
    deadline.setDate(deadline.getDate() + TAX_FORM_DEADLINE_DAYS);

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = deadline.getTime() - now.getTime();

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds, isExpired: false };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return timeLeft;
}

function useIsDeadlinePassed(endTime: Date | null) {
  const [isPassed, setIsPassed] = useState(false);

  useEffect(() => {
    if (!endTime) {
      setIsPassed(false);
      return;
    }

    const deadline = new Date(endTime);
    deadline.setDate(deadline.getDate() + TAX_FORM_DEADLINE_DAYS);

    const checkDeadline = () => {
      setIsPassed(new Date() >= deadline);
    };

    checkDeadline();
    const timer = setInterval(checkDeadline, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  return isPassed;
}

function CountdownTimer({ endTime }: { endTime: Date | null }) {
  const timeLeft = useCountdown(endTime);

  if (!timeLeft) return null;

  if (timeLeft.isExpired) {
    return (
      <div className="flex items-center gap-1.5 text-negative text-sm">
        <Clock className="w-3.5 h-3.5" />
        <span className="font-medium">Deadline passed</span>
      </div>
    );
  }

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
  const { address, isConnected } = useAccount();
  const { ui } = Tenant.current();
  const isDeadlinePassed = useIsDeadlinePassed(proposal.endTime);
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

  // Check if this is an onchain governance proposal
  // Can be identified by tag or by proposal type
  const rawTag =
    proposal.archiveMetadata?.rawTag ??
    (Array.isArray((proposal as unknown as { tags?: string[] }).tags)
      ? (proposal as unknown as { tags?: string[] }).tags?.[0]
      : undefined);
  const normalizedTag = rawTag?.toLowerCase();
  const hasGovTag =
    normalizedTag === "gov-proposal" || normalizedTag === "govproposal";

  const onchainProposalTypes = ["STANDARD", "APPROVAL", "OPTIMISTIC"];
  const hasOnchainType = proposal.proposalType
    ? onchainProposalTypes.includes(proposal.proposalType)
    : false;

  const isOnchainProposal = hasGovTag || hasOnchainType;
  const requiresTaxForm =
    isEnabled && isWaitingForPayment && isOnchainProposal && !isFormCompleted;

  // Skip when globally off or non-gov proposals
  if (!requiresTaxForm) {
    return null;
  }

  const bannerClass =
    "flex items-center justify-between gap-4 rounded-lg bg-neutral px-4 py-3 shadow-newDefault mb-6 min-h-[64px]";
  const contentClass = "flex items-center gap-2 flex-1";

  const payeeButtonClass =
    "px-7 py-3.5 text-sm font-semibold rounded-lg bg-black text-neutral hover:shadow-newHover outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0";

  // Pre-login: show generic banner only if a payee_recipient is set
  if (!isSignedIn) {
    if (!hasPayeeKey) {
      return null;
    }
    return (
      <div className={bannerClass}>
        <div className={contentClass}>
          <div className="bg-wash rounded-md p-1.5">
            <CheckCircleBrokenIcon className="w-4 h-4" stroke="#7A7A7A" />
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
        <div className="bg-wash rounded-md p-1.5">
          <CheckCircleBrokenIcon className="w-4 h-4" stroke="#7A7A7A" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-secondary text-sm md:text-sm">
            You&apos;re almost ready to receive the funds from this proposal.
            Please complete your payment information to proceed.
          </p>
          <CountdownTimer endTime={proposal.endTime} />
        </div>
      </div>
      {payeeFormUrl ? (
        <UpdatedButton
          href={isDeadlinePassed ? undefined : payeeFormUrl}
          type="primary"
          className={`${payeeButtonClass} ${isDeadlinePassed ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
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
