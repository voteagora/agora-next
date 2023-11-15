import * as theme from "@/lib/theme";
import ENSAvatar from "../shared/ENSAvatar";
import { css } from "@emotion/css";
import { HStack, VStack } from "../Layout/Stack";
import HumanAddress from "../shared/HumanAddress";
import { formatNumber } from "@/lib/utils";

export function DelegateProfileImage({ address, votingPower }) {
  const formattedNumber = formatNumber(votingPower, 18, 4);

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
          address={address}
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
          {formattedNumber} OP
        </div>
      </VStack>
    </HStack>
  );
}
