"use client";

import { DelegateButton } from "./DelegateButton";
import { DelegateSocialLinks } from "./DelegateSocialLinks";
import { PartialDelegateButton } from "./PartialDelegateButton";
import { useAccount } from "wagmi";
import { AdvancedDelegateButton } from "./AdvancedDelegateButton";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { Button } from "@/components/Button";
import { ConnectKitButton } from "connectkit";
import { type SyntheticEvent } from "react";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";

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

  const { contracts, ui, namespace } = Tenant.current();
  const hasAlligator = contracts?.alligator;

  const isRetired = ui.delegates?.retired.includes(
    delegate.address.toLowerCase() as `0x${string}`
  );

  const delegationButton = () => {
    switch (namespace) {
      case TENANT_NAMESPACES.SCROLL:
        return <PartialDelegateButton full={false} delegate={delegate} />;

      // Optimism in the only tenant currently supporting advnaced delegation
      case TENANT_NAMESPACES.OPTIMISM:
        if (isAdvancedUser && hasAlligator) {
          return (
            <AdvancedDelegateButton
              delegate={delegate}
              delegators={delegators}
            />
          );
        } else {
          return (
            <DelegateButton full={!twitter && !discord} delegate={delegate} />
          );
        }

      //   The following tenants only support full token-based delegation:
      //   ENS,Cyber,Ether.fi, Uniswap
      default:
        return (
          <DelegateButton full={!twitter && !discord} delegate={delegate} />
        );
    }
  };

  if (isRetired) {
    return (
      <div className="rounded-lg border border-line p-2 bg-line text-xs font-medium text-secondary">
        This voter has stepped down. If you are currently delegated to them,
        please select a new voter.
      </div>
    );
  }

  return (
    <div className="flex flex-row items-stretch justify-between">
      <DelegateSocialLinks
        discord={discord}
        twitter={twitter}
        warpcast={warpcast}
      />
      <div>
        {isConnected && address ? (
          delegationButton()
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
    </div>
  );
}
