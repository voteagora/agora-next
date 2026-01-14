"use client";

import { useMemo } from "react";
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

type Props = {
  proposal: Proposal;
};

export function TaxFormBanner({ proposal }: Props) {
  const { address, isConnected } = useAccount();
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
  const rawTag =
    proposal.archiveMetadata?.rawTag ??
    (Array.isArray((proposal as unknown as { tags?: string[] }).tags)
      ? (proposal as unknown as { tags?: string[] }).tags?.[0]
      : undefined);
  const normalizedTag = rawTag?.toLowerCase();
  const isGovProposal =
    normalizedTag === "gov-proposal" || normalizedTag === "govproposal";
  const requiresTaxForm =
    isEnabled && isWaitingForPayment && isGovProposal && !isFormCompleted;

  // Skip when globally off or non-gov proposals
  if (!requiresTaxForm) {
    return null;
  }

  const bannerClass =
    "flex items-center justify-between gap-4 rounded-lg bg-neutral px-4 py-3 shadow-newDefault mb-6 min-h-[64px]";
  const contentClass = "flex items-center gap-2 flex-1";

  const payeeButtonClass =
    "px-7 py-3.5 text-sm font-semibold rounded-lg bg-black text-neutral hover:shadow-newHover outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0";

  // Pre-login: always show generic banner
  if (!isSignedIn) {
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
        <p className="text-secondary text-sm md:text-sm">
          You’re almost ready to receive the funds from this proposal. Please
          complete your payment information to proceed.
        </p>
      </div>
      {payeeFormUrl ? (
        <UpdatedButton
          href={payeeFormUrl}
          type="primary"
          className={payeeButtonClass}
          target="_blank"
          rel="noreferrer"
        >
          Complete payee form
        </UpdatedButton>
      ) : null}
    </div>
  );
}
