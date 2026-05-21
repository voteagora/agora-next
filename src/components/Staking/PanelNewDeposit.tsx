"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import Tenant from "@/lib/tenant/tenant";
import { useNavigate } from "@tanstack/react-router";
import { useAccount } from "wagmi";

import depositImage from "@/assets/tenant/uniswap_staking_deposit.svg";

export const PanelNewDeposit = () => {
  const { isConnected } = useAccount();
  const { token, namespace } = Tenant.current();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-3 max-w-[354px] w-full py-5 px-[17px] rounded-xl border border-line bg-wash shadow-newDefault">
      <img
        src={depositImage as string}
        alt="results 2"
        height={164}
        width={320}
      />
      <div className="text-md text-primary">
        {`Stake your ${token.symbol} to start earning rewards from ${namespace} liquidity pools.`}
      </div>
      <Button
        className="mt-2"
        variant="default"
        disabled={!isConnected}
        onClick={() => navigate({ to: "/staking/new" })}
      >
        Stake {token.symbol} to start earning
      </Button>
    </div>
  );
};
