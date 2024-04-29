"use client";
import Image from "next/image";
import { icons } from "@/assets/icons/icons";
import DelegatesFilter from "@/components/Delegates/DelegatesFilter/DelegatesFilter";
import { HStack } from "@/components/Layout/Stack";
import CreateStakeHeader from "@/app/staking/components/CreateStakeHeader";

export default function SelectDelegatesHeader() {
  return (
    <HStack className="justify-between">
      <CreateStakeHeader title="Chose your delegate" step={2} />
      <div className="flex flex-col sm:flex-row justify-between gap-4 w-full sm:w-fit">
        <DelegatesFilter />
      </div>
    </HStack>
  );
}
