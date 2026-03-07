import type { Address } from "viem";
import { arbitrum, base, mainnet, optimism, polygon, scroll, sepolia } from "viem/chains";

export type SafeMessageConfirmation = {
  owner: `0x${string}`;
  signature?: `0x${string}`;
  submittedAt?: string;
};

export type SafeMessageStatus = {
  safeAddress: `0x${string}`;
  messageHash: `0x${string}`;
  confirmations: SafeMessageConfirmation[];
  signedOwners: `0x${string}`[];
};

export function encodeSafeMessageConfirmations(
  confirmations: SafeMessageConfirmation[]
): `0x${string}` {
  const encoded = confirmations
    .filter(
      (
        confirmation
      ): confirmation is SafeMessageConfirmation & {
        signature: `0x${string}`;
      } => Boolean(confirmation.signature)
    )
    .slice()
    .sort((left, right) => left.owner.localeCompare(right.owner))
    .map((confirmation) => confirmation.signature.slice(2))
    .join("");

  return `0x${encoded}` as `0x${string}`;
}

type SafeMessageStatusApiResponse = {
  safe?: Address;
  messageHash?: `0x${string}`;
  confirmations?: Array<{
    owner?: Address;
    signature?: `0x${string}`;
    signatureType?: string;
    created?: string;
    modified?: string;
  }>;
};

const SAFE_TRANSACTION_SERVICE_NETWORK_NAMES: Record<number, string> = {
  [mainnet.id]: "mainnet",
  [optimism.id]: "optimism",
  [polygon.id]: "polygon",
  [base.id]: "base",
  [arbitrum.id]: "arbitrum",
  [sepolia.id]: "sepolia",
  [scroll.id]: "scroll",
};

export function getSafeTransactionServiceBaseUrl(chainId: number) {
  const networkName = SAFE_TRANSACTION_SERVICE_NETWORK_NAMES[chainId];
  if (!networkName) {
    return null;
  }

  return `https://safe-transaction-${networkName}.safe.global/api/v1`;
}

export async function fetchSafeMessageStatus(
  chainId: number,
  messageHash: `0x${string}`
): Promise<SafeMessageStatus | null> {
  const baseUrl = getSafeTransactionServiceBaseUrl(chainId);
  if (!baseUrl) {
    throw new Error(`Unsupported Safe transaction service chain: ${chainId}`);
  }

  const response = await fetch(`${baseUrl}/messages/${messageHash}`);
  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Failed to load Safe message status (${response.status})`
    );
  }

  const payload =
    (await response.json()) as SafeMessageStatusApiResponse | null;
  const confirmations = (payload?.confirmations ?? []).reduce<
    SafeMessageConfirmation[]
  >((allConfirmations, confirmation) => {
    if (!confirmation.owner) {
      return allConfirmations;
    }

    allConfirmations.push({
      owner: confirmation.owner.toLowerCase() as `0x${string}`,
      signature: confirmation.signature,
      submittedAt: confirmation.modified ?? confirmation.created,
    });

    return allConfirmations;
  }, []);

  const signedOwners = Array.from(
    new Set(confirmations.map((confirmation) => confirmation.owner))
  );

  return {
    safeAddress: (payload?.safe ?? "").toLowerCase() as `0x${string}`,
    messageHash,
    confirmations,
    signedOwners,
  };
}
