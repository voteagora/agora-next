import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import { shortAddress } from "@/lib/utils";

export default function OptionDescription({ description, value, target }) {
  return (
    <span>
      {"//"} {description} requesting <TokenAmountDisplay amount={value} />{" "}
      transfer to {shortAddress(target)}
    </span>
  );
}
