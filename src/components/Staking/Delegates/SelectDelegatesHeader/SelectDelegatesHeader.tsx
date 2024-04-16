"use client";
import Image from "next/image";
import { icons } from "@/assets/icons/icons";
import DelegatesFilter from "@/components/Delegates/DelegatesFilter/DelegatesFilter";
import { HStack } from "@/components/Layout/Stack";
import Link from "next/link";

export default function SelectDelegatesHeader() {
  return (
    <HStack className="justify-between">
      <div className="flex flex-row text-center gap-4 ">
        <Link
          href="/staking"
          className="w-10 h-10 flex justify-center items-center rounded-full border border-gray-300 cursor:pointer"
        >
          <Image
            height={24}
            width={24}
            src={icons.arrow_right}
            alt="arrowback"
          />
        </Link>
        <h1 className="text-2xl font-black text-black">
          Chose your delegate to continue
        </h1>
      </div>
      <div className="flex flex-col sm:flex-row justify-between gap-4 w-full sm:w-fit">
        <DelegatesFilter />
      </div>
    </HStack>
  );
}
