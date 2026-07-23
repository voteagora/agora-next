"use client";

import { useAccount } from "wagmi";
import Link from "next/link";
import Tenant from "@/lib/tenant/tenant";

export function DelegateCardEditProfile({
  delegateAddress,
}: {
  delegateAddress: string;
}) {
  const { address } = useAccount();
  const copy = Tenant.current().ui.copy;

  if (address?.toLowerCase() !== delegateAddress.toLowerCase()) return null;
  return (
    <Link className="px-4 py-6 border-t border-line" href={`/delegates/create`}>
      <span className="p-2 text-primary font-semibold">
        {copy.delegates.profile.editMyProfile}
      </span>
    </Link>
  );
}
