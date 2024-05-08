"use client";

import { HStack } from "@/components/Layout/Stack";
import { StakingPoolStats } from "@/app/staking/components/StakingPoolStats";
import FAQs from "@/app/staking/components/FAQs";
import { PanelClaimRewards } from "@/app/staking/components/PanelClaimRewards";
import React, { useEffect, useRef, useState } from "react";
import Tenant from "@/lib/tenant/tenant";
import { BigNumberish } from "ethers";
import { useAccount } from "wagmi";
import { StakedDeposit } from "@/lib/types";
import { PanelNewDeposit } from "@/app/staking/components/PanelNewDeposit";
import { DepositList } from "@/app/staking/components/deposits/DepositList";
import type { Delegate } from "@/app/api/common/delegates/delegate";

interface StakeHomeProps {
  fetchDeposits: (address: string) => Promise<StakedDeposit[] | null>;
  fetchDelegate: (address: string) => Promise<Delegate>;
  rewardDuration: string;
  rewardPerToken: BigNumberish;
  totalStaked: BigNumberish;
  totalSupply: BigNumberish;
}

export const StakeHome = ({
  fetchDeposits,
  fetchDelegate,
  rewardDuration,
  rewardPerToken,
  totalStaked,
  totalSupply,
}: StakeHomeProps) => {
  const { token } = Tenant.current();
  const { address } = useAccount();
  const [deposits, setDeposits] = useState<StakedDeposit[] | null>(null);

  const isFetched = useRef(false);
  const isFetching = useRef(false);
  const hasDeposits = isFetched.current && deposits && deposits.length > 0;

  const fetchData = async (address: string) => {
    isFetching.current = true;
    const data = await fetchDeposits(address);
    if (data) {
      setDeposits(data);
    }
    isFetched.current = true;
  };

  useEffect(() => {
    if (address && !isFetched.current && !isFetching.current) {
      fetchData(address.toLowerCase());
    }
  }, [address]);

  return (
    <HStack className="grid grid-cols-1 grid-rows-2 sm:grid-cols-4 sm:grid-rows-1 gap-5 sm:gap-10 mt-12">
      <div className="sm:col-span-4">
        {hasDeposits ? (
          <div>
            <div className="font-black text-2xl mb-5">
              Your {token.symbol} Stake
            </div>
            <DepositList deposits={deposits} fetchDelegate={fetchDelegate} />
          </div>
        ) : (
          <div>
            <div className="font-black text-2xl mb-5">
              Introducing staking, the next chapter of Uniswap Governance
            </div>
            <div className="text-gray-700">
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem
              accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
              quae ab illo inventore veritatis et quasi architecto beatae vitae
              dicta sunt explicabo.
            </div>
          </div>
        )}

        <div className="mt-10">
          <div className="font-black text-2xl mb-5">
            {token.symbol} Staking Metrics
          </div>
          <StakingPoolStats
            rewardDuration={rewardDuration}
            rewardPerToken={rewardPerToken}
            totalStaked={totalStaked}
            totalSupply={totalSupply}
          />
        </div>
        <FAQs />
      </div>
      <div className="sm:col-start-5">
        {hasDeposits ? (
          <div>
            <h2 className="font-black text-2xl text-black mb-5">
              Your rewards
            </h2>
            <PanelClaimRewards />
          </div>
        ) : (
          <PanelNewDeposit />
        )}
      </div>
    </HStack>
  );
};
