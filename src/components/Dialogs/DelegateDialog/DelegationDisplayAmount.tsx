import { HStack } from "@/components/Layout/Stack";
import { formatNumber, tokens } from "@/lib/tokenUtils";
import Image from "next/image";
import { useMemo } from "react";
import tokenIcon from "@/icons/tokenIcon.svg";
import styles from "./delegateDialog.module.scss";

export function DelegationDisplayAmount({
  amount,
}: {
  amount: bigint | string;
}) {
  const formattedNumber = useMemo(() => {
    return formatNumber(amount, "optimism", 4);
  }, [amount]);

  return (
    <HStack
      gap={2}
      className={styles.token_amount_container}
      alignItems="items-center"
    >
      <Image src={tokenIcon} alt={"OP"} width={32} height={32} />
      {formattedNumber} {tokens.optimism.symbol}
    </HStack>
  );
}
