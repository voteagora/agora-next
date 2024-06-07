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

  const { contracts, ui } = Tenant.current();
  const hasAlligator = contracts?.alligator;

  const isRetired = ui.delegates?.retired.includes(
    delegate.address.toLowerCase(),
  );

  if (isRetired) {
    return (
      <div className="rounded-lg border border-gray-300 p-2 bg-gray-100 text-xs font-medium text-gray-700">
        This voter has stepped down. If you are currently delegated to them, please select a new voter.
      </div>
    );
  }

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
        {isConnected ? (
          address &&
          (isAdvancedUser && hasAlligator ? (
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
