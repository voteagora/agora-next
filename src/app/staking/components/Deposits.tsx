"use client";

import React, { useEffect, useRef, useState } from "react";
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

  const fetching = useRef(false);
  const loaded = useRef(false);
  const [deposits, setDeposits] = useState<StakedDeposit[] | null>([]);

  const hasDeposits =  loaded.current && deposits && deposits.length > 0;

  async function getDeposits(a: string) {
    fetching.current = true;

    const data = await fetchStaked(a);
    if (data) {
      setDeposits(data);
    }
    fetching.current = false;
    loaded.current = true;
  }

  useEffect(() => {
    if (address && !fetching.current && !loaded.current) {
      getDeposits(address.toLowerCase());
    }
  }, [address, fetching.current, loaded.current]);

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
