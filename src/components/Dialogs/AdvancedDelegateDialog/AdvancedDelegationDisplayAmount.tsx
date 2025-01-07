import { formatNumberForAdvancedDelegation } from "@/lib/tokenUtils";
import Image from "next/image";
import { useMemo } from "react";
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
    <div className="flex flex-row gap-2 text-primary text-4xl sm:text-5xl font-semibold leading-none items-center">
      {formattedNumber}
      <Image src={ui.logo} alt={token.symbol} width={36} height={36} />
    </div>
  );
}
