import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VStack } from "@/components/Layout/Stack";

const StartUniStackCard = () => {
  return (
    <VStack className="max-w-[354px] w-full items-center py-5 px-[17px] rounded-lg  border border-gray-300 shadow-newDefault">
      <Image
        src="/images/start-stake-uni.svg"
        alt="results 2"
        height="164"
        width="320"
      />
      <p className="text-base font-medium font-inter leading-6 mt-[14px]">
        Stake your UNI to start earning rewards from Uniswap liquidity pools
      </p>
      <Link className="w-full" href="/staking/deposits/create">
        <Button size="lg" className="w-full mt-[18px] mb-1">
          Stake UNI to start earning
        </Button>
      </Link>
    </VStack>
  );
};

export default StartUniStackCard;
