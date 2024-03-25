import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import { shortAddress } from "@/lib/utils";
import Tenant from "@/lib/tenant/tenant";

export default function OptionDescription({ description, value, target }) {
  const { token } = Tenant.current();

  return (
    <span>
      {"//"} {description} requesting{" "}
      <TokenAmountDisplay
        amount={value}
        decimals={token.decimals}
        currency={token.symbol}
      />{" "}
      transfer to {shortAddress(target)}
    </span>
  );
}
