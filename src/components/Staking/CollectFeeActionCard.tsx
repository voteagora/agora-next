import React from "react";
import { Button } from "@/components/ui/button";
import { HStack, VStack } from "@/components/Layout/Stack";
import Image from "next/image";
import { icons } from "@/assets/icons/icons";

const CollectFeeActionCard = () => {
  return (
    <HStack
      gap={4}
      className="p-4 rounded-lg border border-gray-300 shadow-newDefault mt-5"
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
  );
};

export default CollectFeeActionCard;
