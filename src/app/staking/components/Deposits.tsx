"use client";

import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { StakedDepositList } from "@/app/staking/components/StakedDepositList";
import { StakedDeposit } from "@/lib/types";
import Tenant from "@/lib/tenant/tenant";

interface DepositsProps {
  fetchStaked: (address: string) => Promise<StakedDeposit[] | null>;
}

export const Deposits = ({ fetchStaked }: DepositsProps) => {
  const { token } = Tenant.current();
  const { address } = useAccount();

  const [isLoadingDeposits, setIsLoadingDeposits] = useState<boolean>(false);
  const [deposits, setDeposits] = useState<StakedDeposit[] | []>([]);
  const hasDeposits = !isLoadingDeposits || deposits.length > 0;

  async function getDeposits(a: string) {
    setIsLoadingDeposits(true);

    const data = await fetchStaked(a);
    if (data && data.length >= 0) {
      setIsLoadingDeposits(false);
      setDeposits(data);
    }
  }

  useEffect(() => {
    if (address && deposits.length === 0 && !isLoadingDeposits) {
      getDeposits(address.toLowerCase());
    }
  }, [address, deposits, getDeposits]);

  if (hasDeposits && address) {
    return (
      <div>
        <div className="font-black text-2xl mb-5">
          Your {token.symbol} Deposits
        </div>
        <StakedDepositList address={address} deposits={deposits} />
      </div>
    );
  }

  return (
    <div>
      <div className="font-black text-2xl mb-5">
        Introducing staking, the next chapter of Uniswap Governance
      </div>
      <div className="text-gray-700">
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem
        accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab
        illo inventore veritatis et quasi architecto beatae vitae dicta sunt
        explicabo.
      </div>
    </div>
  );
};
