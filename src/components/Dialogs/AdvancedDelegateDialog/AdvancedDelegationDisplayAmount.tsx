import { HStack } from "@/components/Layout/Stack";
import { formatNumberForAdvancedDelegation } from "@/lib/tokenUtils";
import Image from "next/image";
import { useMemo } from "react";
import tokenIcon from "@/icons/tokenIcon.svg";
import styles from "./advancedDelegateDialog.module.scss";
import Tenant from "@/lib/tenant/tenant";

export function AdvancedDelegationDisplayAmount({
  amount,
}: {
  amount: string;
}) {
  const { token } = Tenant.current();

  const formattedNumber = useMemo(() => {
    return formatNumberForAdvancedDelegation(amount);
  }, [amount]);

  return (
    <HStack
      gap={2}
      className={styles.token_amount_container}
      alignItems="items-center"
    >
      {formattedNumber}
      <Image src={tokenIcon} alt={token.symbol} width={36} height={36} />
    </HStack>
  );
}
