"use client";

import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, type SyntheticEvent } from "react";
import { HStack } from "@/components/Layout/Stack";
import { DelegateSocialLinks } from "./DelegateSocialLinks";

import { DelegateChunk } from "../DelegateCardList/DelegateCardList";
import { Button } from "@/components/Button";

export function DelegateActions({
  delegate,
  className,

  setSelectedDelegateAddress,
}: {
  delegate: DelegateChunk;
  className?: string;
  setSelectedDelegateAddress: Dispatch<SetStateAction<string | null>>;
}) {
  const router = useRouter();
  const twitter = delegate?.statement?.twitter;
  const discord = delegate?.statement?.discord;

  const handleSelectDelegate = (address: string) => {
    router.push(`/staking/deposits/create?delegate=${address}`);
  };

  return (
    <HStack
      alignItems="items-stretch"
      className={className ? className + "justify-between" : "justify-between"}
    >
      <DelegateSocialLinks discord={discord} twitter={twitter} />
      <div>
        <Button
          onClick={(e: SyntheticEvent) => {
            e.preventDefault();
            e.stopPropagation();
            handleSelectDelegate(delegate.address);
          }}
          size="lg"
          className="!px-5 text-base font-semibold !text-white !bg-black !min-w-[179px]"
        >
          Select as delegate
        </Button>
      </div>
    </HStack>
  );
}
