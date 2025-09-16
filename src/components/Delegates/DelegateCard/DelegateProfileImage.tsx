"use client";

import ENSAvatar from "../../shared/ENSAvatar";
import CopyableHumanAddress from "../../shared/CopyableHumanAddress";
import { useEnsName } from "wagmi";
import { formatNumber } from "@/lib/tokenUtils";
import React, { useEffect, useMemo } from "react";
import Image from "next/image";
import { useConnectButtonContext } from "@/contexts/ConnectButtonContext";
import { formatEther } from "viem";
import Tenant from "@/lib/tenant/tenant";
import { icons } from "@/icons/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UIEndorsedConfig } from "@/lib/tenant/tenantUI";
import ENSName from "@/components/shared/ENSName";
import { CollapsibleText } from "@/components/shared/CollapsibleText";
import { SCWProfileImage } from "./SCWProfileImage";
import { cn } from "@/lib/utils";

interface Props {
  address: string;
  copyable?: boolean;
  endorsed: boolean;
  votingPower: string;
  scwAddress?: string;
  truncateText?: boolean;
  showVotingPower?: boolean;
  participation?: number;
  showParticipation?: boolean;
}

export function DelegateProfileImage({
  address,
  copyable = false,
  endorsed,
  votingPower,
  truncateText = false,
  showVotingPower = false,
  participation,
  showParticipation = false,
}: Props) {
  const { ui } = Tenant.current();
  const { refetchDelegate, setRefetchDelegate } = useConnectButtonContext();
  const formattedNumber = useMemo(() => {
    return formatNumber(votingPower);
  }, [votingPower]);

  const endorsedToggle = ui.toggle("delegates/endorsed-filter");
  const hasEndorsedFilter = Boolean(
    endorsedToggle?.enabled && endorsedToggle?.config !== undefined
  );

  const { data } = useEnsName({
    chainId: 1,
    address: address as `0x${string}`,
  });

  useEffect(() => {
    /**
     * When formatted voting power is different from refetch it means it has been updated
     */
    if (
      refetchDelegate?.address === address &&
      refetchDelegate?.prevVotingPowerDelegatee
    ) {
      const _votingPowerFormatted = Number(
        formatEther(BigInt(refetchDelegate?.prevVotingPowerDelegatee))
      ).toFixed(2);
      const _formattedNumber = Number(formattedNumber).toFixed(2);
      if (_votingPowerFormatted !== _formattedNumber) {
        setRefetchDelegate(null);
      }
    }

    return () => {
      // If this component unmounts for a given address there is no point to refetch it when it is not on the UI anymore
      if (
        refetchDelegate?.address === address &&
        refetchDelegate?.prevVotingPowerDelegatee
      ) {
        setRefetchDelegate(null);
      }
    };
  }, [address, formattedNumber, refetchDelegate, setRefetchDelegate]);

  return (
    <div className="flex flex-row gap-4 items-center">
      <div className="relative aspect-square">
        <ENSAvatar className="rounded-full w-[44px] h-[44px]" ensName={data} />
      </div>

      <div className="flex flex-col min-w-0">
        <div className="text-primary flex flex-row gap-1 font-medium items-center min-w-0">
          <div
            className={cn(
              "min-w-0 max-w-full flex-1",
              truncateText && "truncate"
            )}
          >
            {copyable ? (
              <CopyableHumanAddress address={address} />
            ) : (
              <ENSName address={address} />
            )}
          </div>
          {endorsed && hasEndorsedFilter && endorsedToggle && (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger className="shrink-0">
                  <Image
                    src={icons.endorsed}
                    alt={(endorsedToggle.config as UIEndorsedConfig).tooltip}
                    className="w-4 h-4"
                  />
                </TooltipTrigger>

                <TooltipContent>
                  <div className="text-xs">
                    {(endorsedToggle.config as UIEndorsedConfig).tooltip}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {(showVotingPower || showParticipation) && (
          <div className="flex flex-row gap-2 text-xs text-secondary font-medium items-center">
            {showVotingPower && (
              <span>
                {formattedNumber} {Tenant.current().token.symbol}
              </span>
            )}
            {showVotingPower &&
              showParticipation &&
              participation !== undefined && (
                <div className="h-3 border-r border-tertiary"></div>
              )}
            {showParticipation && participation !== undefined && (
              <span>{Math.round(participation)}% Participation</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function DelegateProfileImageWithMetadata({
  address,
  endorsed,
  votingPower,
  description,
  location,
  followersCount,
  followingCount,
  scwAddress,
  showVotingPower = false,
  participation,
  showParticipation = false,
}: Omit<Props, "truncateText"> & {
  description?: string;
  location?: string;
  followersCount?: string;
  followingCount?: string;
}) {
  const { ui } = Tenant.current();
  const { refetchDelegate, setRefetchDelegate } = useConnectButtonContext();
  const formattedNumber = useMemo(() => {
    return formatNumber(votingPower);
  }, [votingPower]);

  const endorsedToggle = ui.toggle("delegates/endorsed-filter");
  const hasEndorsedFilter = Boolean(
    endorsedToggle?.enabled && endorsedToggle?.config !== undefined
  );

  const { data } = useEnsName({
    chainId: 1,
    address: address as `0x${string}`,
  });

  useEffect(() => {
    /**
     * When formatted voting power is different from refetch it means it has been updated
     */
    if (
      refetchDelegate?.address === address &&
      refetchDelegate?.prevVotingPowerDelegatee
    ) {
      const _votingPowerFormatted = Number(
        formatEther(BigInt(refetchDelegate?.prevVotingPowerDelegatee))
      ).toFixed(2);
      const _formattedNumber = Number(formattedNumber).toFixed(2);
      if (_votingPowerFormatted !== _formattedNumber) {
        setRefetchDelegate(null);
      }
    }

    return () => {
      // If this component unmounts for a given address there is no point to refetch it when it is not on the UI anymore
      if (
        refetchDelegate?.address === address &&
        refetchDelegate?.prevVotingPowerDelegatee
      ) {
        setRefetchDelegate(null);
      }
    };
  }, [address, formattedNumber, refetchDelegate, setRefetchDelegate]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-4 items-center">
        <div className="relative aspect-square">
          <ENSAvatar
            className="rounded-full w-[48px] h-[48px]"
            ensName={data}
            size={48}
          />
        </div>
        <div className="flex flex-col">
          <div className="text-primary flex flex-row gap-1 font-semibold hover:opacity-90">
            <div className="flex flex-col">
              <CopyableHumanAddress
                className="font-bold"
                address={address}
                copyENSName
              />
              {data ? ( // Only show address if ENS name is available and displayed in the above CopyableHumanAddress
                <CopyableHumanAddress
                  className="text-xs font-medium"
                  address={address}
                  useAddress={true}
                />
              ) : null}
            </div>
            {endorsed && hasEndorsedFilter && endorsedToggle && (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger>
                    <Image
                      src={icons.endorsed}
                      alt={(endorsedToggle.config as UIEndorsedConfig).tooltip}
                      className="w-4 h-4"
                    />
                  </TooltipTrigger>

                  <TooltipContent>
                    <div className="text-xs">
                      {(endorsedToggle.config as UIEndorsedConfig).tooltip}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {!!location && (
            <div className="text-sm text-secondary">{location}</div>
          )}
          {!!followersCount && !!followingCount && (
            <div className="text-xs text-primary font-medium">
              <span className="font-bold">{followingCount}</span> following ·{" "}
              <span className="font-bold">{followersCount}</span> followers
            </div>
          )}
          {(showVotingPower || showParticipation) && (
            <div className="flex flex-row gap-3 text-xs text-secondary">
              {showVotingPower && (
                <span>
                  {formattedNumber} {Tenant.current().token.symbol}
                </span>
              )}
              {showParticipation && participation !== undefined && (
                <span>{Math.round(participation)}% Participation</span>
              )}
            </div>
          )}
        </div>
      </div>
      {scwAddress && (
        <>
          <div className="flex flex-col items-stretch pl-2 relative">
            <SCWProfileImage address={scwAddress} copyable={true} />
            <div className="h-[14px] border-l border-line border-dotted absolute left-[22px] top-[-14px] height-[14px]" />
          </div>
        </>
      )}

      {!!description && (
        <div className="text-sm text-secondary">
          <CollapsibleText text={description} />
        </div>
      )}
    </div>
  );
}
