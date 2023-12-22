"use client";

import { HStack } from "@/components/Layout/Stack";
import { DelegateButton } from "./DelegateButton";
import { DelegateSocialLinks } from "./DelegateSocialLinks";
import { useAccount } from "wagmi";
import { AdvancedDelegateButton } from "./AdvancedDelegateButton";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { DelegateChunk } from "../DelegateCardList/DelegateCardList";

export function DelegateActions({
  delegate,
  className,
  isAdvancedUser,
}: {
  delegate: DelegateChunk;
  className?: string;
  isAdvancedUser: boolean;
}) {
  const { isConnected } = useAgoraContext();
  const { address } = useAccount();
  const twitter = delegate?.statement?.twitter;
  const discord = delegate?.statement?.discord;

  return (
    <HStack
      alignItems="items-stretch"
      className={className ? className + "justify-between" : "justify-between"}
    >
      <DelegateSocialLinks discord={discord} twitter={twitter} />
      <div>
        {isConnected &&
          address &&
          (isAdvancedUser ? (
            <AdvancedDelegateButton delegate={delegate} />
          ) : (
            <DelegateButton
              full={!twitter && !discord}
              delegateAddress={delegate.address}
            />
          ))}
      </div>
    </HStack>
  );
}
