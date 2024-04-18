"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { HStack, VStack } from "@/components/Layout/Stack";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import Link from "next/link";

const ConfirmStakingCard = () => {
  return (
    <VStack className="rounded-lg border border-gray-300 shadow-newDefault ">
      <Tabs defaultValue="redeem" className="w-full">
        <TabsList className="grid w-full gap-0 grid-cols-2 h-14">
          <TabsTrigger
            className="w-full h-full border-b border-b-gray-300 border-r border-r-gray-300 bg-gray-fa opacity-70 data-[state=active]:border-none data-[state=active]:bg-transparent"
            value="redeem"
          >
            <p className="text-base font-semibold text-black">Redeem stake</p>
          </TabsTrigger>
          <TabsTrigger
            className="w-full h-full border-b border-b-gray-300 border-l border-l-gray-300 bg-gray-fa opacity-70 data-[state=active]:border-none data-[state=active]:bg-transparent"
            value="stake"
          >
            <p className="text-base font-semibold text-black"> Stake UNI</p>
          </TabsTrigger>
        </TabsList>
        <TabsContent className="mx-4 mt-5" value="redeem">
          <div className="border rounded-lg">
            <VStack className="w-full h-[123px] justify-center text-center rounded-lg border-b border-b-gray-300 shadow-newDefault ">
              <p className="text-xs font-semibold text-gray-4f">
                Stake UNI to earn fees
              </p>
              <HStack className="w-full justify-center items-center">
                <h6 className="items-center gap-x-3 text-[44px] font-semibold text-black ">
                  25,000
                </h6>
                <Image
                  src="/images/horse_icon.png"
                  alt="img"
                  width={40}
                  height={40}
                  className="rounded"
                />
              </HStack>
            </VStack>
            <HStack className="w-full flex items-center bg-gray-fa rounded-lg">
              <VStack className="w-full text-xs font-semibold text-gray-4f items-center p-4 border-r border-r-gray-300 ">
                Available to stake
                <h6 className="text-base font-medium text-black">
                  500,000 UNI
                </h6>
              </VStack>
              <VStack className="w-full items-center p-4">
                <p className="text-xs font-semibold text-gray-4f">
                  Already staked
                </p>
                <h6 className="text-base font-medium text-black">25,000 UNI</h6>
              </VStack>
            </HStack>
          </div>
          <p className="text-xs font-medium text-gray-4f my-4 max-w-[322px]">
            Once your UNI is staked, you will start earning from pools where
            fees are turned on.
          </p>
          <Link href="/staking/delegates?isRedeemStake=true">
            <Button className="w-full mb-7">Continue</Button>
          </Link>
        </TabsContent>
        <TabsContent className="mx-4 mt-5" value="stake">
          <div className="border rounded-lg">
            <VStack className="w-full h-[123px] justify-center text-center rounded-lg border-b border-b-gray-300 shadow-newDefault ">
              <p className="text-xs font-semibold text-gray-4f">
                Stake UNI to earn fees
              </p>
              <HStack className="w-full justify-center items-center">
                <h6 className="items-center gap-x-3 text-[44px] font-semibold text-black ">
                  0
                </h6>
                <Image
                  src="/images/horse_icon.png"
                  alt="img"
                  width={40}
                  height={40}
                  className="rounded"
                />
              </HStack>
            </VStack>
            <HStack className="w-full flex items-center bg-gray-fa rounded-lg">
              <VStack className="w-full text-xs font-semibold text-gray-4f items-center p-4 border-r border-r-gray-300 ">
                Available to stake
                <h6 className="text-base font-medium text-black">
                  500,000 UNI
                </h6>
              </VStack>
              <VStack className="w-full items-center p-4">
                <p className="text-xs font-semibold text-gray-4f">
                  Already staked
                </p>
                <h6 className="text-base font-medium text-black">0 UNI</h6>
              </VStack>
            </HStack>
          </div>
          <p className="text-xs font-medium text-gray-4f my-4 max-w-[322px]">
            Once your UNI is staked, you will start earning from pools where
            fees are turned on.
          </p>
          <Link href="/staking/delegates">
            <Button className="w-full mb-7">Continue</Button>
          </Link>
        </TabsContent>
      </Tabs>
    </VStack>
  );
};

export default ConfirmStakingCard;
