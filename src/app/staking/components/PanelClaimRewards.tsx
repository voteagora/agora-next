"use client";

import { Button } from "@/components/ui/button";
import { icons } from "@/assets/icons/icons";
import { formatNumber } from "@/lib/utils";
import React from "react";
import Image from "next/image";
import Link from "next/link";

import rewardsImage from "@/assets/tenant/uniswap_staking_rewards.svg";

export const PanelClaimRewards = () => {
  // TODO: Andrei - this needs to be implemented once the rewards are supported
  const hasRewards = false;

  return (
    <div className="flex flex-col rounded-xl border border-gray-300 max-w-[354px] w-full h-100 bg-gray-50 shadow-newDefault">
      <div className="flex flex-col py-5 px-[17px] rounded-xl bg-white border-b border-b-gray-300 shadow-newDefault">
        <Image src={rewardsImage} alt="results 2" height="164" width="320" />
        <div className="flex flex-row gap-4 my-4">
          <div className="min-w-[48px] h-12 p-3 rounded-lg  border border-gray-300 shadow-newDefault ">
            <Image height={24} width={24} src={icons.currency} alt="" />
          </div>
          <div className="flex flex-col">
            <p className="text-xs font-semibold text-gray-4f">
              Available to collect
            </p>
            <h6 className="text-base font-medium text-black">
              {formatNumber(0, 18)} WETH
            </h6>
          </div>
        </div>
        <Button variant="outline" size="lg" disabled={!hasRewards}>
          Collect rewards
        </Button>
      </div>
      <div className="py-3 px-5 text-sm text-gray-600">
        Fees have not yet been enabled on any pools, so there are no rewards for
        stakers at this time. To follow the fee development, keep an eye on the{" "}
        <Link
          href="https://gov.uniswap.org/"
          className="underline"
          target="_blank"
        >
          discussions in the forums
        </Link>
        .
      </div>
    </div>
  );
};
