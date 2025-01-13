"use client";

import ENSAvatar from "../../shared/ENSAvatar";
import HumanAddress from "@/components/shared/HumanAddress";
import { formatNumber } from "@/lib/tokenUtils";
import React from "react";
import Tenant from "@/lib/tenant/tenant";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import CopyableHumanAddress from "@/components/shared/CopyableHumanAddress";
import { CubeIcon } from "@/icons/CubeIcon";
import { rgbStringToHex } from "@/app/lib/utils/color";

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
          <div className="flex items-center justify-center rounded-full border border-line w-[44px] h-[44px]">
            <CubeIcon
              className="w-6 h-6"
              fill={rgbStringToHex(ui.customization?.primary)}
            />
          </div>
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
        {`This is a smart account which is used to enable gasless delegation.`}
      </div>
    </div>
  );
}
