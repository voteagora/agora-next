"use client";

import ENSAvatar from "../../shared/ENSAvatar";
import { HStack, VStack } from "@/components/Layout/Stack";
import HumanAddress from "../../shared/HumanAddress";
import { useEnsName } from "wagmi";
import { TOKEN, formatNumber } from "@/lib/tokenUtils";
import { useMemo } from "react";
import styles from "./delegateCard.module.scss";

export function DelegateProfileImage({ address, votingPower }) {
  const formattedNumber = useMemo(() => {
    return formatNumber(votingPower);
  }, [votingPower]);

  const { data } = useEnsName({
    chainId: 1,
    address,
  });

  return (
    <HStack className="gap-4">
      <div className={styles.profile_image}>
        <ENSAvatar className={styles.avatar} ensName={data} />
      </div>

      <VStack>
        <div className={styles.address}>
          <HumanAddress address={address} />
        </div>
        <div className={styles.token}>
          {formattedNumber} {TOKEN.symbol}
        </div>
      </VStack>
    </HStack>
  );
}
