import { HStack } from "@/components/Layout/Stack";
import { formatNumber } from "@/lib/tokenUtils";
import Image from "next/image";
import { useMemo } from "react";
import tokenIcon from "@/icons/tokenIcon.svg";
import Tenant from "@/lib/tenant/tenant";

export function DelegationDisplayAmount({
  amount,
}: {
  amount: bigint | string;
}) {
  const { token } = Tenant.current();
  const formattedNumber = useMemo(() => {
    return formatNumber(amount);
  }, [amount]);

  return (
    <HStack
      gap={2}
      className="text-black text-3xl sm:text-4xl"
      alignItems="items-center"
    >
      <Image src={tokenIcon} alt={token.symbol} width={32} height={32} />
      {formattedNumber} {token.symbol}
    </HStack>
  );
}
