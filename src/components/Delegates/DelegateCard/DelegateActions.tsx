"use client";

import { HStack } from "@/components/Layout/Stack";
import { DelegateButton } from "./DelegateButton";
import { DelegateSocialLinks } from "./DelegateSocialLinks";
import { useAccount } from "wagmi";
import { AdvancedDelegateButton } from "./AdvancedDelegateButton";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { DelegateChunk } from "../DelegateCardList/DelegateCardList";
import { Button } from "@/components/Button";
import { ConnectKitButton } from "connectkit";
import { type SyntheticEvent } from "react";

export function DelegateActions({
  delegate,
  className,
  isAdvancedUser,
  delegators,
}: {
  delegate: DelegateChunk;
  className?: string;
  isAdvancedUser: boolean;
  delegators: string[] | null;
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
        {isConnected ? (
          address &&
          (isAdvancedUser ? (
            <AdvancedDelegateButton
              delegate={delegate}
              delegators={delegators}
            />
          ) : (
            <DelegateButton full={!twitter && !discord} delegate={delegate} />
          ))
        ) : (
          <ConnectKitButton.Custom>
            {({ show }) => (
              <Button
                onClick={(e: SyntheticEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  show?.();
                }}
              >
                Delegate
              </Button>
            )}
          </ConnectKitButton.Custom>
        )}
      </div>
    </HStack>
  );
}
