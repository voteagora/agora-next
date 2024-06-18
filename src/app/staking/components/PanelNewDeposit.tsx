"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import Image from "next/image";
import Tenant from "@/lib/tenant/tenant";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

export const PanelNewDeposit = () => {
  const { isConnected } = useAccount();
  const { token, namespace } = Tenant.current();
  const router = useRouter();

  return (
    <div
      className="flex flex-col gap-3 max-w-[354px] w-full py-5 px-[17px] rounded-xl border border-gray-300 shadow-newDefault">
      <Image
        src="/images/uni_deposit.svg"
        alt="results 2"
        height="164"
        width="320"
      />
      <div className="text-md">
        {`Stake your ${token.symbol} to start earning rewards from ${namespace} liquidity pools.`}
      </div>
      <Button
        className="mt-2"
        variant="default"
        disabled={!isConnected}
        onClick={() => router.push("/staking/new")}
      >
        Stake {token.symbol} to start earning
      </Button>
    </div>
  );
};
