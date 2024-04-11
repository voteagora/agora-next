"use client";


import Tenant from "@/lib/tenant/tenant";
import { useAccount } from "wagmi";
import { ethers } from "ethers";

export const UnstakedBalance = async () => {

  const { contracts, token } = Tenant.current();
  const { address } = useAccount();

  if (!address) {
    throw new Error("Address is undefined");
  }

  const balance = await contracts.token.contract.balanceOf(address);

  return <div>Available to stake: {`${ethers.formatEther(balance.toString())} ${token.symbol}`}</div>;

};
