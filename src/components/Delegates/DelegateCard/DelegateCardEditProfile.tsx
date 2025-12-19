"use client";

import { useAccount } from "wagmi";

export function DelegateCardEditProfile({
  delegateAddress,
}: {
  delegateAddress: string;
}) {
  const { address } = useAccount();

  if (address?.toLowerCase() !== delegateAddress.toLowerCase()) return null;
  return null;
}
