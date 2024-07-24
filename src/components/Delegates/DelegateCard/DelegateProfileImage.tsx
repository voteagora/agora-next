"use client";

import ENSAvatar from "../../shared/ENSAvatar";
import HumanAddress from "@/components/shared/HumanAddress";
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
  const { token } = Tenant.current();
  const formattedNumber = useMemo(() => {
    return formatNumber(votingPower);
  }, [votingPower]);

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
    <div className="flex flex-row gap-4">
      <div className="relative aspect-square">
        {citizen && (
          <Image
            className="absolute bottom-[-5px] right-[-7px] z-10"
            src={icons.badge}
            alt="badge symbol"
          />
        )}
        <ENSAvatar className="rounded-full w-[44px] h-[44px]" ensName={data} />
      </div>

      <div className="flex flex-col">
        <div className="text-base flex flex-row gap-1 font-semibold hover:opacity-90">
          {copyable ? (
            <CopyableHumanAddress address={address} />
          ) : (
            <HumanAddress address={address} />
          )}
          {endorsed && (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger>
                  <Image
                    src={icons.endorsed}
                    alt={`Endorsed by ${ui.organization?.title}`}
                    className="w-4 h-4"
                  />
                </TooltipTrigger>

                <TooltipContent>
                  <div className="text-xs">
                    Endorsed by {ui.organization?.title}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="text-secondary text-xs font-semibold">
          {formattedNumber} {token.symbol}
        </div>
      </div>
    </div>
  );
}
