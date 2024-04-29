import { HStack } from "@/components/Layout/Stack";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import React from "react";

const SelfVotingDelegateCard = () => {
  return (
    <HStack
      gap={5}
      className="flex-wrap sm:flex-nowrap p-7 rounded-lg border border-gray-300 shadow-newDefault"
    >
      <Image
        src="/images/horse_icon.png"
        alt="img"
        width={40}
        height={40}
        className="rounded w-auto h-auto"
      />
      <p>
        Want to vote yourself? Delegate your votes to yourself to engage
        directly in Uniswap governance{" "}
      </p>

      <Button
        variant="outline"
        size="lg"
        className="!px-5 text-base font-semibold text-black !min-w-[156px]"
      >
        I’ll vote myself
      </Button>
    </HStack>
  );
};

export default SelfVotingDelegateCard;
