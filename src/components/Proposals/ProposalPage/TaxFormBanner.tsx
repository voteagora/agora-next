"use client";

import { addDays, isPast, differenceInMilliseconds } from "date-fns";
import { CheckCircle, ExternalLink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { UpdatedButton } from "@/components/Button";
import { CheckCircleBrokenIcon } from "@/icons/CheckCircleBrokenIcon";
import { PROPOSAL_STATUS } from "@/lib/constants";
import Tenant from "@/lib/tenant/tenant";
import {
  addressesMatch,
  EXECUTION_TRANSACTIONS_KEY,
  extractPayeesFromMetadata,
  getExplorerTxUrl,
  PAYEE_FORM_URL_KEY,
  type PayeeBannerInfo,
} from "@/lib/taxFormUtils";

const TAX_FORM_DEADLINE_DAYS = 15;

type ExecutionTransaction = {
  id: string;
  transaction_hash: string;
  chain_id: number;
  executed_by: string;
  executed_at: string;
};

function useTaxFormDeadline(
  endTime: Date | null,
  enabled: boolean,
  isFormCompleted: boolean
) {
  const deadline = useMemo(() => {
    if (!endTime) return null;
    return addDays(new Date(endTime), TAX_FORM_DEADLINE_DAYS);
  }, [endTime]);

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!enabled || !deadline || isFormCompleted) return;

    setNow(new Date());

    if (isPast(deadline)) return;

    const minuteTimer = setInterval(() => setNow(new Date()), 60000);

    const msUntilDeadline = deadline.getTime() - Date.now();
    const expiryTimer =
      msUntilDeadline > 0
        ? setTimeout(() => setNow(new Date()), msUntilDeadline)
        : undefined;

    return () => {
      clearInterval(minuteTimer);
      if (expiryTimer) clearTimeout(expiryTimer);
    };
  }, [deadline, enabled, isFormCompleted]);

  const isExpired = !isFormCompleted && deadline ? isPast(deadline) : false;

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

function DeadlineDisplay({
  deadline,
  isExpired,
  isFormCompleted,
  now,
}: {
  deadline: Date | null;
  isExpired: boolean;
  isFormCompleted: boolean;
  now: Date;
}) {
  if (!deadline) return null;

  if (isFormCompleted) {
    return (
      <span className="text-positive inline-flex items-center gap-1">
        <CheckCircle className="w-3.5 h-3.5" />
        Complete
      </span>
    );
  }

  if (isExpired) {
    return <span className="text-negative font-medium">Passed</span>;
  }

  const timeLeft = formatTimeLeft(deadline, now);
  if (!timeLeft) return null;

  const isUrgent = timeLeft.days < 3;
  const colorClass = isUrgent ? "text-negative" : "text-positive";

  return (
    <span className={`tabular-nums font-medium ${colorClass}`}>
      {timeLeft.days > 0 && `${timeLeft.days}d `}
      {String(timeLeft.hours).padStart(2, "0")}h{" "}
      {String(timeLeft.minutes).padStart(2, "0")}m
    </span>
  );
}

function PayeeRow({
  payee,
  deadline,
  isDeadlinePassed,
  now,
  executionTransactions,
  isMultiPayee,
}: {
  payee: PayeeBannerInfo;
  deadline: Date | null;
  isDeadlinePassed: boolean;
  now: Date;
  executionTransactions: ExecutionTransaction[];
  isMultiPayee: boolean;
}) {
  const hasTxHash = Boolean(payee.txHash);
  const matchingTx = payee.txHash
    ? executionTransactions.find(
        (tx) =>
          tx.transaction_hash.toLowerCase() === payee.txHash!.toLowerCase()
      )
    : null;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Payee */}
      <span>
        <span className="font-medium text-primary">Payee:</span>{" "}
        <span className="font-mono text-secondary">{payee.address}</span>
        {(payee.paymentType || payee.paymentAmount) && (
          <span className="text-secondary ml-1">
            (
            {[payee.paymentType, payee.paymentAmount]
              .filter(Boolean)
              .join(" · ")}
            )
          </span>
        )}
      </span>

      <span className="text-line">·</span>

      {/* Deadline — stops when this payee's form is complete */}
      <span>
        <span className="font-medium text-primary">Deadline:</span>{" "}
        <DeadlineDisplay
          deadline={deadline}
          isExpired={isDeadlinePassed}
          isFormCompleted={payee.isFormCompleted}
          now={now}
        />
      </span>

      <span className="text-line">·</span>

      {/* Tax Form */}
      <span>
        <span className="font-medium text-primary">Tax Form:</span>{" "}
        {payee.isFormCompleted ? (
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
        {hasTxHash && matchingTx ? (
          <a
            href={getExplorerTxUrl(
              matchingTx.chain_id,
              matchingTx.transaction_hash
            )}
            target="_blank"
            rel="noreferrer"
            className="text-positive inline-flex items-center gap-1 hover:underline"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Paid
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : hasTxHash ? (
          <span className="text-positive inline-flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            Paid
          </span>
        ) : !isMultiPayee && executionTransactions.length > 0 ? (
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

  const { payees, payeeFormUrl, executionTransactions } = useMemo(() => {
    const metadata = proposal.taxFormMetadata ?? {};
    const payees = extractPayeesFromMetadata(metadata);

    const executionTransactions = (metadata[EXECUTION_TRANSACTIONS_KEY] ??
      []) as ExecutionTransaction[];

    return {
      payees,
      payeeFormUrl:
        (metadata[PAYEE_FORM_URL_KEY] as string | undefined) ??
        togglePayeeFormUrl,
      executionTransactions,
    };
  }, [proposal.taxFormMetadata, togglePayeeFormUrl]);

  const isWaitingForPayment = proposal.status === PROPOSAL_STATUS.SUCCEEDED;
  const isSignedIn = Boolean(address);
  const hasAnyPayee = payees.length > 0;

  // Identify whether connected user matches any payee
  const currentUserPayee = useMemo(
    () =>
      isSignedIn
        ? payees.find((p) => addressesMatch(p.address, address ?? null))
        : undefined,
    [payees, address, isSignedIn]
  );
  const currentUserIsPayee = Boolean(currentUserPayee);
  const currentUserFormDone = currentUserPayee?.isFormCompleted ?? false;
  const allFormsDone =
    payees.length > 0 && payees.every((p) => p.isFormCompleted);

  const rawTag =
    proposal.archiveMetadata?.rawTag ??
    (Array.isArray((proposal as unknown as { tags?: string[] }).tags)
      ? (proposal as unknown as { tags?: string[] }).tags?.[0]
      : undefined);
  const normalizedTag = rawTag?.toLowerCase();

  const isTempCheck =
    normalizedTag === "tempcheck" || normalizedTag === "temp-check";

  const hasGovTag =
    normalizedTag === "gov-proposal" || normalizedTag === "govproposal";

  const onchainProposalTypes = ["STANDARD", "APPROVAL", "OPTIMISTIC"];
  const hasOnchainType = proposal.proposalType
    ? onchainProposalTypes.includes(proposal.proposalType)
    : false;

  const isOnchainProposal = hasGovTag || hasOnchainType;

  const shouldShowBanner =
    isEnabled &&
    isWaitingForPayment &&
    isOnchainProposal &&
    !isTempCheck &&
    hasAnyPayee;

  const {
    deadline,
    isExpired: isDeadlinePassed,
    now,
  } = useTaxFormDeadline(proposal.endTime, shouldShowBanner, allFormsDone);

  if (!shouldShowBanner) {
    return null;
  }

  const showPayeeCTA =
    isSignedIn &&
    currentUserIsPayee &&
    !currentUserFormDone &&
    !isDeadlinePassed;
  const showSignInPrompt = !isSignedIn && !allFormsDone && !isDeadlinePassed;

  const hasSecondRow = showSignInPrompt || showPayeeCTA;
  const isMultiPayee = payees.length > 1;

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
            {payees.map((payee) => (
              <PayeeRow
                key={payee.index}
                payee={payee}
                deadline={deadline}
                isDeadlinePassed={isDeadlinePassed}
                now={now}
                executionTransactions={executionTransactions}
                isMultiPayee={isMultiPayee}
              />
            ))}

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
