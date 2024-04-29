"use client";

import Tenant from "@/lib/tenant/tenant";
import { useAccount } from "wagmi";
import { useUnclaimedReward } from "@/hooks/useUnclaimedReward";
import { HStack, VStack } from "@/components/Layout/Stack";
import { Button } from "@/components/ui/button";
import { icons } from "@/assets/icons/icons";
import { formatNumber } from "@/lib/utils";
import React from "react";
import Image from "next/image";

export const ClaimRewards = () => {

  const { token } = Tenant.current();
  const { address } = useAccount();
  const { isConnected } = useAccount();
  const { data, isFetched } = useUnclaimedReward(address);
  const hasRewards = data && data > 0;

  return (
    <VStack className="mt-5 max-w-[354px] w-full py-5 px-[17px] rounded-lg border border-gray-300 shadow-newDefault">
      <Image
        src="/images/rewards.svg"
        alt="results 2"
        height="164"
        width="320"
      />
      <HStack gap={4} className="mt-4">
        <div className="min-w-[48px] h-12 p-3 rounded-lg  border border-gray-300 shadow-newDefault ">
          <Image height={24} width={24} src={icons.currency} alt="" />
        </div>
        <VStack>
          <p className="text-xs font-semibold text-gray-4f">
            Available to collect
          </p>
          <h6 className="text-base font-medium text-black">
            {isConnected ? `${formatNumber(hasRewards ? data : 0, token.decimals)} WETH ` : "Connect wallet for balance"}
          </h6>
        </VStack>
      </HStack>
      <Button
        variant="outline"
        size="lg"
        disabled={!hasRewards}
        className="px-5 text-base font-semibold text-black mt-5"
      >
        Collect rewards
      </Button>
    </VStack>
  );
};
