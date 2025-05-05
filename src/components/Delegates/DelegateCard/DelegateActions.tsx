"use client";

import { DelegateButton } from "./DelegateButton";
import { UndelegateButton } from "./UndelegateButton";
import { DelegateSocialLinks } from "./DelegateSocialLinks";
import { useAccount } from "wagmi";
import { AdvancedDelegateButton } from "./AdvancedDelegateButton";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { UpdatedButton } from "@/components/Button";
import { ConnectKitButton } from "connectkit";
import { type SyntheticEvent } from "react";
import Tenant from "@/lib/tenant/tenant";
import { DELEGATION_MODEL } from "@/lib/constants";
import { useGetDelegatees } from "@/hooks/useGetDelegatee";
import { PartialDelegateButton } from "./PartialDelegateButton";

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

  // gets the delegatees for the connected account
  const { data: delegatees } = useGetDelegatees({ address });
  const isConnectedAccountDelegate = !!delegatees?.find(
    (delegatee) => delegatee.to === delegate.address
  );

  const ButtonToShow = isConnectedAccountDelegate
    ? UndelegateButton
    : DelegateButton;

  const delegationButton = () => {
    switch (contracts.delegationModel) {
      case DELEGATION_MODEL.PARTIAL:
        return (
          <PartialDelegateButton
            full={false}
            delegate={delegate}
            isConnectedAccountDelegate={isConnectedAccountDelegate}
          />
        );

      // Optimism in the only tenant currently supporting advanced delegation
      case DELEGATION_MODEL.ADVANCED:
        if (isAdvancedUser && hasAlligator) {
          return (
            <AdvancedDelegateButton
              delegate={delegate}
              delegators={delegators}
            />
          );
        } else {
          return (
            <ButtonToShow full={!twitter && !discord} delegate={delegate} />
          );
        }

      //   The following tenants only support full token-based delegation:
      //   ENS,Cyber,Ether.fi, Uniswap
      default:
        return <ButtonToShow full={!twitter && !discord} delegate={delegate} />;
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
              <UpdatedButton
                type="secondary"
                onClick={(e: SyntheticEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  show?.();
                }}
              >
                {isConnectedAccountDelegate ? "Undelegate" : "Delegate"}
              </UpdatedButton>
            )}
          </ConnectKitButton.Custom>
        )}
      </div>
    </div>
  );
}
