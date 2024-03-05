"use client";

import ENSAvatar from "../../shared/ENSAvatar";
import { HStack, VStack } from "@/components/Layout/Stack";
import HumanAddress from "../../shared/HumanAddress";
import { useEnsName } from "wagmi";
import { formatNumber } from "@/lib/tokenUtils";
import { useMemo } from "react";
import styles from "./delegateCard.module.scss";
import Image from "next/image";
import badge from "@/icons/badge.svg";
import Tenant from "@/lib/tenant";

export function DelegateProfileImage({
  address,
  votingPower,
  citizen,
}: {
  address: string;
  votingPower: string;
  citizen?: boolean;
}) {
  const { token } = Tenant.getInstance();

  const formattedNumber = useMemo(() => {
    return formatNumber(votingPower);
  }, [votingPower]);

  const { data } = useEnsName({
    chainId: 1,
    address: address as `0x${string}`,
  });

  return (
    <HStack className="gap-4">
      <div className={styles.profile_image}>
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
          <HumanAddress address={address} />
        </div>
        <div className={styles.token}>
          {formattedNumber} {token.symbol}
        </div>
      </VStack>
    </HStack>
  );
}
