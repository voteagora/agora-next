"use client";

import { useAccount } from "wagmi";
import Link from "next/link";
import { useSelectedWallet } from "@/contexts/SelectedWalletContext";

export function DelegateCardEditProfile({
  delegateAddress,
}: {
  delegateAddress: string;
}) {
  const { selectedWalletAddress, isSelectedPrimaryAddress } =
    useSelectedWallet();

  if (selectedWalletAddress?.toLowerCase() !== delegateAddress.toLowerCase())
    return null;
  return (
    <>
      <Link
        className="px-4 py-6 border-t border-line"
        href={`/delegates/create`}
      >
        <span className="p-2 text-primary font-semibold">
          Edit delegate statement
        </span>
      </Link>
      <Link className="px-4 py-6" href={`/delegates/editDetails`}>
        <span className="p-2 text-primary font-semibold">
          Edit delegate details
        </span>
      </Link>
    </>
  );
}
