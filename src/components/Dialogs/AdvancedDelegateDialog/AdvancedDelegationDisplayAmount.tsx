import { HStack } from "@/components/Layout/Stack";
import { formatNumberForAdvancedDelegation } from "@/lib/tokenUtils";
import Image from "next/image";
import { useMemo } from "react";
import styles from "./advancedDelegateDialog.module.scss";
import Tenant from "@/lib/tenant/tenant";

export function AdvancedDelegationDisplayAmount({
  amount,
}: {
  amount: string;
}) {
  const { token, ui } = Tenant.current();

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
      <Image src={ui.logo} alt={token.symbol} width={36} height={36} />
    </HStack>
  );
}
