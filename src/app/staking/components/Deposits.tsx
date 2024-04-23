"use client";

import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { StakedDepositList } from "@/app/staking/components/StakedDepositList";
import { StakedDeposit } from "@/lib/types";

interface DepositsProps {
  fetchStaked: (address: string) => Promise<StakedDeposit[] | null>;
}

export const Deposits = ({ fetchStaked }: DepositsProps) => {
  const { address } = useAccount();

  const [deposits, setDeposits] = useState<StakedDeposit[] | []>([]);

  async function getDeposits(a: string) {
    const data = await fetchStaked(a);
    if (data && data.length >= 0) {
      setDeposits(data);
    }
  }

  useEffect(() => {
    if (address && deposits.length === 0) {
      getDeposits(address.toLowerCase());
    }
  }, [address, deposits]);

  if (deposits.length === 0) {
    return (
      <div className="text-xs text-slate-600 py-4">Loading deposits...</div>
    );
  }

  return <StakedDepositList deposits={deposits} />;
};
