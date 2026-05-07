import type {
  SafeOffchainSigningKind,
  SafeOffchainSigningPurpose,
} from "@/lib/safeOffchainFlow";
import type { SafeMessageConfirmation } from "@/lib/safeTransactionService";

export function getSafeVerifyingCopy(params: {
  purpose: SafeOffchainSigningPurpose;
  signingKind: SafeOffchainSigningKind;
  hasRequiredSignatures: boolean;
}) {
  const { purpose, signingKind, hasRequiredSignatures } = params;

  if (hasRequiredSignatures) {
    if (purpose === "delegate_statement") {
      return {
        title: "Verifying Safe signature",
        description:
          signingKind === "siwe"
            ? "All required Safe signatures were collected. Agora is verifying the Safe sign-in message."
            : "All required Safe signatures were collected. Agora is validating the approved delegate profile message.",
      };
    }

    return {
      title: "Verifying Safe signature",
      description:
        "All required Safe signatures were collected. Agora is verifying the Safe sign-in message.",
    };
  }

  if (purpose === "delegate_statement") {
    return {
      title: "Verifying Safe signature",
      description:
        signingKind === "siwe"
          ? "Agora is checking the Safe sign-in response before it saves your delegate profile."
          : "Agora is checking the Safe approval response before it saves your delegate profile.",
    };
  }

  if (purpose === "notification_preferences") {
    return {
      title: "Verifying Safe signature",
      description:
        "Agora is checking the Safe sign-in response before it opens notification preferences.",
    };
  }

  return {
    title: "Verifying Safe signature",
    description:
      "Agora is checking the Safe sign-in response before it creates the draft.",
  };
}

export function mergeSafeMessageConfirmations(
  previousConfirmations: SafeMessageConfirmation[],
  nextConfirmations: SafeMessageConfirmation[]
) {
  const order: string[] = [];
  const byOwner = new Map<string, SafeMessageConfirmation>();

  for (const confirmation of previousConfirmations) {
    const owner = confirmation.owner.toLowerCase();
    order.push(owner);
    byOwner.set(owner, confirmation);
  }

  for (const confirmation of nextConfirmations) {
    const owner = confirmation.owner.toLowerCase();
    const previousConfirmation = byOwner.get(owner);

    if (!previousConfirmation) {
      order.push(owner);
      byOwner.set(owner, confirmation);
      continue;
    }

    byOwner.set(owner, {
      owner: confirmation.owner,
      signature: confirmation.signature ?? previousConfirmation.signature,
      submittedAt: confirmation.submittedAt ?? previousConfirmation.submittedAt,
    });
  }

  return order
    .map((owner) => byOwner.get(owner))
    .filter((confirmation): confirmation is SafeMessageConfirmation =>
      Boolean(confirmation)
    );
}

export function safeMessageConfirmationsEqual(
  left: SafeMessageConfirmation[],
  right: SafeMessageConfirmation[]
) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((confirmation, index) => {
    const comparison = right[index];
    return (
      confirmation.owner === comparison?.owner &&
      confirmation.signature === comparison?.signature &&
      confirmation.submittedAt === comparison?.submittedAt
    );
  });
}

export function shouldIgnoreLateSafeSiweResult(params: {
  completedSuccessfully: boolean;
  hasStoredJwt: boolean;
}) {
  return params.completedSuccessfully || params.hasStoredJwt;
}
