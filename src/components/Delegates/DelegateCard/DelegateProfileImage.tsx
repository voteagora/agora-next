"use client";

import ENSAvatar from "../../shared/ENSAvatar";
import { HStack, VStack } from "@/components/Layout/Stack";
import HumanAddress from "@/components/shared/HumanAddress";
import CopyableHumanAddress from "../../shared/CopyableHumanAddress";
import { useEnsName } from "wagmi";
import { formatNumber } from "@/lib/tokenUtils";
import { useMemo } from "react";
import styles from "./delegateCard.module.scss";
import Image from "next/image";
import badge from "@/icons/badge.svg";
import { useEffect } from "react";
import { useConnectButtonContext } from "@/contexts/ConnectButtonContext";
import { formatEther } from "viem";
import Tenant from "@/lib/tenant/tenant";

export function DelegateProfileImage({
  address,
  votingPower,
  citizen,
  copyable = false,
}: {
  address: string;
  votingPower: string;
  citizen?: boolean;
  copyable?: boolean;
}) {
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
    <HStack className="gap-4">
      <div className="relative aspect-square">
        {citizen && (
          <Image
            className="absolute bottom-[-5px] right-[-7px] z-10"
            src={badge}
            alt="badge symbol"
          />
        )}
        <ENSAvatar className={styles.avatar} ensName={data} />
      </div>

      <VStack>
        <div className={styles.address}>
          {copyable ? (
            <CopyableHumanAddress address={address} />
          ) : (
            <HumanAddress address={address} />
          )}
        </div>
        <div className={styles.token}>
          {formattedNumber} {token.symbol}
        </div>
      </VStack>
    </HStack>
  );
}
