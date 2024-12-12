"use client";

import ENSAvatar from "../../shared/ENSAvatar";
import HumanAddress from "@/components/shared/HumanAddress";
import CopyableHumanAddress from "../../shared/CopyableHumanAddress";
import { useEnsName } from "wagmi";
import { formatNumber } from "@/lib/tokenUtils";
import React, { useMemo } from "react";
import Tenant from "@/lib/tenant/tenant";
import { useDelegate } from "@/hooks/useDelegate";

interface Props {
  address: string;
  copyable?: boolean;
}

export function SCWProfileImage({ address, copyable = false }: Props) {
  const { token } = Tenant.current();

  const { data: delegate, isFetched } = useDelegate({
    address: address as `0x${string}`,
  });

  const votingPower = delegate?.votingPower.total || "";

  const formattedNumber = useMemo(() => {
    if (!isFetched) return "";
    return formatNumber(votingPower);
  }, [votingPower, isFetched]);

  const { data } = useEnsName({
    chainId: 1,
    address: address as `0x${string}`,
  });

  return (
    <div className="flex flex-row gap-4">
      <div className="relative aspect-square">
        <ENSAvatar className="rounded-full w-[44px] h-[44px]" ensName={data} />
      </div>

      <div className="flex flex-col">
        <div className="text-base flex flex-row gap-1 font-semibold hover:opacity-90">
          {copyable ? (
            <CopyableHumanAddress address={address} />
          ) : (
            <HumanAddress address={address} />
          )}
        </div>
        <div className="text-secondary text-xs font-semibold">
          {formattedNumber} {token.symbol}
        </div>
      </div>
    </div>
  );
}
