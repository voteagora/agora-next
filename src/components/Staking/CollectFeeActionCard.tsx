import React from "react";
import { Button } from "@/components/ui/button";
import { HStack, VStack } from "@/components/Layout/Stack";
import Image from "next/image";
import { icons } from "@/assets/icons/icons";
import Link from "next/link";

const CollectFeeActionCard = () => {
  return (
    <div className="border rounded-lg mt-5">
      <HStack
        gap={4}
        className="p-4 rounded-lg border border-gray-300 shadow-newDefault"
      >
        <div className="min-w-[48px] h-12 p-3 rounded-lg  border border-gray-300 shadow-newDefault ">
          <Image height={24} width={24} src={icons.currency} alt="" />
        </div>
        <VStack>
          <p className="text-xs font-semibold text-gray-4f">
            Available to collect
          </p>
          <h6 className="text-base font-medium text-black">2.1 WETH </h6>
        </VStack>
        <Button
          variant="outline"
          size="lg"
          className="px-5 text-base font-semibold text-black"
        >
          Collect fees
        </Button>
      </HStack>
      <VStack className="px-4 pt-[18px]">
        <HStack className="w-full justify-between items-center">
          <p className="text-xs font-semibold text-gray-4f">
            Voted delegated to
          </p>
          <p className="text-xs font-semibold text-gray-4f">Voting activity</p>
        </HStack>
        <HStack className="w-full justify-between items-center text-black">
          <p className="text-base font-medium text-black">gfxlabs.eth</p>
          <p className="text-base font-medium text-black">
            9/10 recent proposals
          </p>
        </HStack>
        <Link href="/staking/deposits/delegates">
          <Button
            variant="outline"
            size="lg"
            className="w-full text-base font-semibold text-black mt-[18px] mb-5"
          >
            Change delegate
          </Button>
        </Link>
      </VStack>
    </div>
  );
};

export default CollectFeeActionCard;
