"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelectedWallet } from "@/contexts/SelectedWalletContext";

export function DelegateCardEditProfile({
  delegateAddress,
  hasStatement,
}: {
  delegateAddress: string;
  hasStatement: boolean;
}) {
  const { selectedWalletAddress } = useSelectedWallet();
  const pathname = usePathname();

  if (selectedWalletAddress?.toLowerCase() !== delegateAddress.toLowerCase())
    return null;

  return (
    <>
      <Link
        className={`px-4 pt-6 border-t border-line`}
        href={`/delegates/create`}
      >
        <span
          className={`p-2 block text-primary font-semibold rounded-sm ${
            pathname === "/delegates/create" ? "bg-brandPrimary/10" : ""
          }`}
        >
          {hasStatement ? "Edit delegate statement" : "Add delegate statement"}
        </span>
      </Link>
      <Link className="px-4 pt-4 pb-6" href={`/delegates/editDetails`}>
        <span
          className={`p-2 block text-primary font-semibold rounded-sm ${
            pathname === "/delegates/editDetails" ? "bg-brandPrimary/10" : ""
          }`}
        >
          Edit delegate details
        </span>
      </Link>
    </>
  );
}
