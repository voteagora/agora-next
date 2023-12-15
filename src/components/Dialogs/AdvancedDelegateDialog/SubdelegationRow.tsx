import { Delegation } from "@/app/api/delegations/delegation";
import { HStack } from "@/components/Layout/Stack";
import HumanAddress from "@/components/shared/HumanAddress";
import { TokenAmountDisplay } from "@/lib/utils";

function SubdelegationToRow({ delegation }: { delegation: Delegation }) {
  return (
    <HStack gap={2}>
      <HumanAddress address={delegation.to} />
      <div>{TokenAmountDisplay(delegation.allowance, 18, "OP", 6)}</div>
    </HStack>
  );
}

export default SubdelegationToRow;
