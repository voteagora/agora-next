import { shortAddress } from "@/lib/utils";

export default function OptionDescription({ description, value, target }) {
  
  return (
    <span>
      {/* TODO: Warning – this dangerously assumes all tokens are OP. For now, ok, but won't always be the case */}
      {"//"} {description} requesting {value} OP transfer to {shortAddress(target)}
    </span>
  );
}
