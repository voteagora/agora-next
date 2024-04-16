import React from "react";
import { HStack, VStack } from "@/components/Layout/Stack";
import Image from "next/image";
import { icons } from "@/assets/icons/icons";
const StackingInfoBoxes = () => {
  return (
    <HStack className="h-auto w-full sm:w-auto flex flex-col sm:flex-row items-center rounded-lg border border-gray-300 shadow-newDefault mt-6">
      <VStack className="w-full items-center p-4 border-b border-b-gray-300 sm:border-r sm:border-r-gray-300 ">
        <p className="text-xs font-semibold text-gray-4f">Total supply</p>
        <h6 className="text-base font-medium text-black">200.1M UNI</h6>
      </VStack>
      <VStack className="w-full items-center p-4 border-b border-b-gray-300 sm:border-r sm:border-r-gray-300 text-gray-700">
        <p className="text-xs font-semibold text-gray-4f">Staked</p>
        <h6 className="text-base font-medium text-black">10.01M UNI</h6>
      </VStack>
      <VStack className="w-full items-center p-4 border-b border-b-gray-300 sm:border-r sm:border-r-gray-300 cursor-pointer ">
        <p className="text-xs font-semibold text-gray-4f">Fees turned on</p>
        <h6 className="flex items-center gap-x-2 text-base font-medium text-black ">
          2 pools <Image height={24} width={24} src={icons.link} alt="" />
        </h6>
      </VStack>
      <VStack className="w-full items-center p-4">
        <p className="text-xs font-semibold text-gray-4f">
          Rewards paid last week
        </p>
        <h6 className="text-base font-medium text-black">24 WETH</h6>
      </VStack>
    </HStack>
  );
};

export default StackingInfoBoxes;
