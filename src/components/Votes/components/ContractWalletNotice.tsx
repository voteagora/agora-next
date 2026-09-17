"use client";

import { useAccount } from "wagmi";
import { truncateAddress } from "@/app/lib/utils/text";
import { useWalletAccountType } from "@/hooks/useWalletAccountType";
import Tenant from "@/lib/tenant/tenant";

/**
 * Informational note for smart contract wallets (Safe, ERC-4337 accounts).
 * EIP-7702 delegated EOAs keep their address, so nothing is shown for them.
 */
export function ContractWalletNotice({ className }: { className?: string }) {
  const { contracts } = Tenant.current();
  const { address } = useAccount();
  const { data: accountType } = useWalletAccountType(
    address,
    contracts.token.chain.id
  );

  if (!address || accountType !== "contract") {
    return null;
  }

  return (
    <p className={className ?? "mb-3 text-xs text-secondary"}>
      You&apos;re connected with a smart contract wallet. Your vote will be
      recorded from {truncateAddress(address)}.
    </p>
  );
}
