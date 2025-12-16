"use client";

import { useMemo } from "react";
import { useAccount } from "wagmi";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { PROPOSAL_STATUS } from "@/lib/constants";
import { UpdatedButton } from "@/components/Button";
import { CheckCircleBrokenIcon } from "@/icons/CheckCircleBrokenIcon";
import Tenant from "@/lib/tenant/tenant";

type Props = {
  proposal: Proposal;
};

const PAYEE_KEY_PRIMARY = "payee_recipient";
const PAYEE_KEY_FALLBACK = "payee_recipient_0";
const FORM_COMPLETED_KEY = "form_completed";
const PAYEE_FORM_URL_KEY = "payee_form_url";

const normalizeAddress = (value?: string | null) => {
  if (!value) return undefined;
  return value
    .trim()
    .replace(/^"+|"+$/g, "")
    .toLowerCase();
};

const addressesMatch = (a?: string | null, b?: string | null) => {
  const na = normalizeAddress(a);
  const nb = normalizeAddress(b);
  if (!na || !nb) return false;
  return na === nb;
};

const normalizeBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  if (typeof value === "number") return value !== 0;
  return false;
};

export function TaxFormBanner({ proposal }: Props) {
  const { address, isConnected } = useAccount();
  const metadata = proposal.taxFormMetadata ?? {};
  const { ui } = Tenant.current();
  const taxFormToggle = ui.toggle("tax-form-banner");
  const isEnabled = taxFormToggle?.enabled ?? false;
  const togglePayeeFormUrl = (
    taxFormToggle?.config as { payeeFormUrl?: string } | undefined
  )?.payeeFormUrl;

  const { hasPayeeKey, currentUserIsPayee, isFormCompleted, payeeFormUrl } =
    useMemo(() => {
      const hasPayeeKey =
        Object.prototype.hasOwnProperty.call(metadata, PAYEE_KEY_PRIMARY) ||
        Object.prototype.hasOwnProperty.call(metadata, PAYEE_KEY_FALLBACK);

      const payeeRaw =
        (metadata[PAYEE_KEY_PRIMARY] as unknown) ??
        (metadata[PAYEE_KEY_FALLBACK] as unknown);

      const payeeValue =
        typeof payeeRaw === "string"
          ? payeeRaw
          : typeof payeeRaw === "object" && payeeRaw !== null
            ? ((payeeRaw as { address?: string; value?: string }).address ??
              (payeeRaw as { address?: string; value?: string }).value)
            : payeeRaw != null
              ? String(payeeRaw)
              : undefined;

      const payeeAddress = normalizeAddress(payeeValue);

      return {
        hasPayeeKey,
        currentUserIsPayee:
          hasPayeeKey && addressesMatch(payeeAddress, address ?? null),
        isFormCompleted: normalizeBoolean(metadata[FORM_COMPLETED_KEY]),
        payeeFormUrl:
          (metadata[PAYEE_FORM_URL_KEY] as string | undefined) ??
          togglePayeeFormUrl,
      };
    }, [address, metadata, togglePayeeFormUrl]);

  const isWaitingForPayment = proposal.status === PROPOSAL_STATUS.SUCCEEDED;
  const isSignedIn = Boolean(address) || isConnected;

  // Global off: feature disabled, wrong status, or completed
  if (!isEnabled || !isWaitingForPayment || isFormCompleted) {
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

  // Post-login: payee set
  if (hasPayeeKey) {
    if (!currentUserIsPayee) {
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

  // Post-login: no payee set -> generic banner (no CTA)
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
