import { Delegation } from "@/app/api/delegations/delegation";
import { HStack } from "@/components/Layout/Stack";
import HumanAddress from "@/components/shared/HumanAddress";
import { TokenAmountDisplay } from "@/lib/utils";

function SubdelegationToRow({ to, amount }: { to: string; amount: string }) {
  return (
    <HStack gap={2}>
      <HumanAddress address={to} />
      <div>{TokenAmountDisplay(amount, 18, "OP", 6)}</div>
    </HStack>
  );
}

export default SubdelegationToRow;
