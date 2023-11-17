import * as theme from "@/styles/theme";
import ENSAvatar from "../../shared/ENSAvatar";
import { css } from "@emotion/css";
import { HStack, VStack } from "../../Layout/Stack";
import HumanAddress from "../../shared/HumanAddress";
import { useEnsName } from "wagmi";
import { formatNumber, tokens } from "@/lib/tokenUtils";
import { useMemo } from "react";

export function DelegateProfileImage({ address, votingPower }) {
  const formattedNumber = useMemo(() => {
    return formatNumber(votingPower, "optimism", 4);
  }, [votingPower]);

  const { data } = useEnsName({
    chainId: 1,
    address,
  });

  return (
    <HStack gap="4">
      <div
        className={css`
          position: relative;
          aspect-ratio: 1/1;
        `}
      >
        <ENSAvatar
          className={css`
            width: 44px;
            height: 44px;
            border-radius: 100%;
          `}
          ensName={data}
        />
      </div>

      <VStack>
        <div
          className={css`
            font-size: ${theme.fontSize.base};
            font-weight: ${theme.fontWeight.semibold};
          `}
        >
          <HumanAddress address={address} />
        </div>
        <div
          className={css`
            font-size: ${theme.fontSize.xs};
            font-weight: ${theme.fontWeight.semibold};
            color: #4f4f4f;
          `}
        >
          {formattedNumber} {tokens["optimism"].symbol}
        </div>
      </VStack>
    </HStack>
  );
}
