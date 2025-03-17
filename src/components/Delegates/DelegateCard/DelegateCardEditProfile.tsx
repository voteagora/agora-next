"use client";

import { useAccount } from "wagmi";
import Link from "next/link";

export function DelegateCardEditProfile({
  delegateAddress,
}: {
  delegateAddress: string;
}) {
  const { address } = useAccount();

  if (address?.toLowerCase() !== delegateAddress.toLowerCase()) return null;
  return (
    <Link className="px-4 py-6 border-t border-line" href={`/delegates/create`}>
      <span className="p-2 text-primary font-semibold">Edit my profile</span>
    </Link>
  );
}
