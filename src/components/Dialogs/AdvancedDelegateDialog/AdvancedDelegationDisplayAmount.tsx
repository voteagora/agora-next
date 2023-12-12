import { HStack } from "@/components/Layout/Stack";
import { TOKEN, formatNumber } from "@/lib/tokenUtils";
import Image from "next/image";
import { useMemo } from "react";
import tokenIcon from "@/icons/tokenIcon.svg";
import styles from "./advancedDelegateDialog.module.scss";

export function AdvancedDelegationDisplayAmount({
  amount,
}: {
  amount: bigint | string;
}) {
  const formattedNumber = useMemo(() => {
    return formatNumber(amount);
  }, [amount]);

  return (
    <HStack
      gap={2}
      className={styles.token_amount_container}
      alignItems="items-center"
    >
      <Image src={tokenIcon} alt={TOKEN.symbol} width={32} height={32} />
      {formattedNumber} {TOKEN.symbol}
    </HStack>
  );
}
