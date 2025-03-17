"use client";

import { formatNumber } from "@/lib/tokenUtils";
import React from "react";
import Tenant from "@/lib/tenant/tenant";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import CopyableHumanAddress from "@/components/shared/CopyableHumanAddress";
import { CubeIcon } from "@/icons/CubeIcon";
import { rgbStringToHex } from "@/app/lib/utils/color";
import ENSName from "@/components/shared/ENSName";

interface Props {
  address: string;
  copyable?: boolean;
}

export function SCWProfileImage({ address, copyable = false }: Props) {
  const { token, ui } = Tenant.current();

  // Note, we are displaying total token balance and not voting power for the SCW account
  const { data: tokenBalance } = useTokenBalance(address);

  return (
    <div>
      <div className="flex flex-row gap-4">
        <div className="relative aspect-square">
          <div className="flex items-center justify-center rounded-full border border-line w-[30px] h-[30px]">
            <CubeIcon
              className="w-[21px] h-[21px]"
              fill={rgbStringToHex(ui.customization?.primary)}
            />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-primary flex flex-row gap-1 font-semibold hover:opacity-90">
            {copyable ? (
              <CopyableHumanAddress address={address} />
            ) : (
              <ENSName address={address} />
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
    </div>
  );
}
