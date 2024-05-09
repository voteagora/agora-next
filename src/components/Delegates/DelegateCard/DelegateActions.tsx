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
import Tenant from "@/lib/tenant/tenant";

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
  const warpcast = delegate?.statement?.warpcast;

  const { contracts } = Tenant.current();
  const hasAlligator = contracts?.alligator;

  return (
    <HStack
      alignItems="items-stretch"
      className={className ? className + "justify-between" : "justify-between"}
    >
      <DelegateSocialLinks
        discord={discord}
        twitter={twitter}
        warpcast={warpcast}
      />
      <div>
        {isConnected ? (address && (isAdvancedUser && hasAlligator ? (
            <>
              ADVANCED
              <AdvancedDelegateButton
                delegate={delegate}
                delegators={delegators}
              />
            </>
          ) : (<>
              REGULER
              <DelegateButton full={!twitter && !discord} delegate={delegate} />
            </>
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
