import { Delegation } from "@/app/api/delegations/delegation";
import DelegationToRow from "./DelegationToRow";
import { HStack, VStack } from "@/components/Layout/Stack";

function DelegationsContainer({
  delegatees,
  delegators,
}: {
  delegatees: Delegation[];
  delegators: Delegation[];
}) {
  return (
    <VStack>
      {delegatees.map((delegation) => (
        <DelegationToRow key={delegation.to} delegation={delegation} />
      ))}
    </VStack>
  );
}

export default DelegationsContainer;
