import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import { shortAddress } from "@/lib/utils";

export default function OptionDescription({ description, value, target }) {
  return (
    <span>
      {/* TODO: only leave option description for approval proposals, remove the rest. Also group this to only be shown once per option */}
      {"//"} {description} requesting <TokenAmountDisplay amount={value} />{" "}
      transfer to {shortAddress(target)}
    </span>
  );
}
