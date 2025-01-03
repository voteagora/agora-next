"use client";

import ENSAvatar from "../../shared/ENSAvatar";
import HumanAddress from "@/components/shared/HumanAddress";
import { formatNumber } from "@/lib/tokenUtils";
import React from "react";
import Tenant from "@/lib/tenant/tenant";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import CopyableHumanAddress from "@/components/shared/CopyableHumanAddress";

interface Props {
  address: string;
  copyable?: boolean;
}

export function SCWProfileImage({ address, copyable = false }: Props) {
  const { token, ui, namespace } = Tenant.current();

  // Note, we are displaying total token balance and not voting power for the SCW account
  const { data: tokenBalance } = useTokenBalance(address);

  const org = ui.organization?.title || namespace;

  return (
    <div>
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
              {"Balance "}
              {formatNumber(tokenBalance)} {token.symbol}
            </div>
          )}
        </div>
      </div>
      <div className="text-xs leading-5 mt-4 text-secondary">
        {`This is a smart account. Agora uses smart accounts to enable
        gasless voting and delegation for ${org}.`}
      </div>
    </div>
  );
}
