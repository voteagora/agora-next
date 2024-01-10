import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import { shortAddress } from "@/lib/utils";

export default function OptionDescription({ description, value, target }) {
  console.log({ value });
  return (
    <span>
      {/* TODO: Warning – this dangerously assumes all tokens are OP. For now, ok, but won't always be the case */}
      {"//"} {description} requesting{" "}
      <TokenAmountDisplay amount={value} decimals={18} currency="OP" /> transfer
      to {shortAddress(target)}
    </span>
  );
}
