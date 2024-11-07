"use client";

import ENSAvatar from "../../shared/ENSAvatar";
import HumanAddress from "@/components/shared/HumanAddress";
import CopyableHumanAddress from "../../shared/CopyableHumanAddress";
import { formatNumber } from "@/lib/tokenUtils";
import React from "react";
import Tenant from "@/lib/tenant/tenant";
import { useTokenBalance } from "@/hooks/useTokenBalance";

interface Props {
  address: string;
  copyable?: boolean;
}

export function SCWProfileImage({ address, copyable = false }: Props) {
  const { token } = Tenant.current();

  // Note, we are displaying total token balance and not voting power
  const { data: tokenBalance } = useTokenBalance(address);

  return (
    <div className="flex flex-row gap-4">
      <div className="relative aspect-square">
        <ENSAvatar
          className="rounded-full w-[44px] h-[44px]"
          ensName={undefined}
        />
      </div>

      <div className="flex flex-col">
        <div className="text-base flex flex-row gap-1 font-semibold hover:opacity-90">
          {copyable ? (
            <CopyableHumanAddress address={address} />
          ) : (
            <HumanAddress address={address} />
          )}
        </div>
        {tokenBalance && (
          <div className="text-secondary text-xs font-semibold">
            {formatNumber(tokenBalance)} {token.symbol}
          </div>
        )}
      </div>
    </div>
  );
}
