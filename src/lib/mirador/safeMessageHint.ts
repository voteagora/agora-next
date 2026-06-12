"use client";

import type {
  SafeOffchainSigningKind,
  SafeOffchainSigningPurpose,
} from "@/lib/safeOffchainFlow";
import { startOrResumeProposalCreationTrace } from "./proposalCreationTrace";
import { startOrResumeSiweLoginTrace } from "./siweLoginTrace";
import type { startMiradorTrace } from "./webTrace";

type SafeMessageHintTrace = ReturnType<typeof startMiradorTrace>;

export function resolveTraceForSafeMessageHint({
  purpose,
  walletAddress,
  chainId,
}: {
  purpose: SafeOffchainSigningPurpose;
  walletAddress?: `0x${string}`;
  chainId?: number | string;
}): SafeMessageHintTrace {
  if (purpose === "proposal_draft") {
    return startOrResumeProposalCreationTrace({ walletAddress, chainId });
  }

  if (
    purpose === "notification_preferences" ||
    purpose === "delegate_statement"
  ) {
    return startOrResumeSiweLoginTrace({ purpose, walletAddress, chainId });
  }

  return null;
}

export function getSafeMessageHintDetails({
  purpose,
  signingKind,
}: {
  purpose?: SafeOffchainSigningPurpose;
  signingKind: SafeOffchainSigningKind;
}): string | undefined {
  const base =
    purpose === "proposal_draft"
      ? "Create proposal"
      : purpose === "notification_preferences"
        ? "Notification preferences"
        : purpose === "delegate_statement"
          ? "Delegate statement"
          : undefined;

  if (!base) {
    return undefined;
  }

  return `${base}${signingKind === "raw_message" ? " Safe message" : " SIWE"}`;
}
