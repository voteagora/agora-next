"use client";

import Tenant from "@/lib/tenant/tenant";
import { useAccount } from "wagmi";
import { ethers } from "ethers";

export const StakedBalance = async () => {

  const { contracts, token } = Tenant.current();
  const { address } = useAccount();

  if (!address) {
    throw new Error("Address is undefined");
  }

  const stakedBalance = await contracts?.staker?.contract?.depositorTotalStaked(address);

  if (!stakedBalance) {
    return "Staked balance is undefined";
  }

  return <div>Total staked: {`${ethers.formatEther(stakedBalance.toString())} ${token.symbol}`}</div>;

};