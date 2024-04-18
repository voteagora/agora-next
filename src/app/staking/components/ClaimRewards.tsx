"use client";

import Tenant from "@/lib/tenant/tenant";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { useAccount } from "wagmi";
import { useUnclaimedReward } from "@/hooks/useUnclaimedReward";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import React from "react";
import Image from "next/image";
import coins from "@/assets/icons/coins.svg";

export const ClaimRewards = () => {
  const { token } = Tenant.current();
  const { isConnected } = useAgoraContext();
  const { address } = useAccount();

  const { data, isFetched } = useUnclaimedReward(address);
  const hasRewards = data && data > 0;

  return (
    <div className="flex flex-col rounded-lg border border-gray-300 w-auto h-100 mb-4 p-5">
      <div className="flex flex-row gap-4 mb-4">
        <div className="border-gray-300 w-100 h-100 p-2 bg-gray-50 rounded-lg border">
          <Image
            src={coins}
            alt="coins"
            width="24"
            height="24"
            className="hidden sm:block"
          />
        </div>
        <div>
          <div className="text-xs">Available to collect</div>
          <div className="font-medium">{`${formatNumber(
            hasRewards ? data : 0,
            token.decimals
          )} WETH`}</div>
        </div>
      </div>

      <Button variant="outline" disabled={!hasRewards}>
        Claim Rewards
      </Button>
    </div>
  );
};
