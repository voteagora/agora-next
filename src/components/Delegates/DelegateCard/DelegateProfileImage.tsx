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

interface Props {
  address: string;
  citizen?: boolean;
  copyable?: boolean;
  endorsed: boolean;
  votingPower: string;
}

export function DelegateProfileImage({
  address,
  citizen,
  copyable = false,
  endorsed,
  votingPower,
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
        {citizen && (
          <Image
            className="absolute bottom-[-5px] right-[-7px] z-10"
            src={icons.badge}
            alt="citizen badge"
          />
        )}
        <ENSAvatar className="rounded-full w-[44px] h-[44px]" ensName={data} />
      </div>

      <div className="flex flex-col">
        <div className="text-primary flex flex-row gap-1 font-semibold hover:opacity-90">
          {copyable ? (
            <CopyableHumanAddress address={address} />
          ) : (
            <ENSName address={address} />
          )}
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
      </div>
    </div>
  );
}

export function DelegateProfileImageWithMetadata({
  address,
  citizen,
  endorsed,
  votingPower,
  description,
  location,
  followersCount,
  followingCount,
}: Props & {
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
          {citizen && (
            <Image
              className="absolute bottom-[-5px] right-[-7px] z-10"
              src={icons.badge}
              alt="citizen badge"
            />
          )}
          <ENSAvatar
            className="rounded-full w-[44px] h-[44px] sm:w-[88px] sm:h-[88px]"
            ensName={data}
            size={88}
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
        </div>
      </div>
      {!!description && (
        <div className="text-sm text-secondary">
          <CollapsibleText text={description} />
        </div>
      )}
    </div>
  );
}
