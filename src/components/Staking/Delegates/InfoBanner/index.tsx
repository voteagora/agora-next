import React from "react";
import Image from "next/image";
import { HStack } from "@/components/Layout/Stack";
import { icons } from "@/icons/icons";

const InfoBanner = () => {
  return (
    <HStack
      gap={4}
      className="py-5 px-6 w-full flex justify-start items-center rounded-lg border border-gray-300 shadow-newDefault mt-4"
    >
      <div className="w-8 h-8 p-1 rounded-lg bg-pink-positive flex justify-center ">
        <Image
          src={icons.notification}
          alt="notification"
          height={24}
          width={24}
          className="cursor-pointer"
        />
      </div>
      <p className="text-base font-semibold text-black">
        Uniswap voters manage staking rewards. Choose your delegate carefully to
        represent you in Uniswap governance.
      </p>
    </HStack>
  );
};

export default InfoBanner;
