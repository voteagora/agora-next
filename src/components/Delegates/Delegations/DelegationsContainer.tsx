import { Delegation } from "@/app/api/delegations/delegation";
import DelegationToRow from "./DelegationToRow";

function DelegationsContainer({
  delegatees,
  delegators,
}: {
  delegatees: Delegation[];
  delegators: Delegation[];
}) {
  return (
    <>
      {delegatees.map((delegation) => (
        <DelegationToRow key={delegation.to} delegation={delegation} />
      ))}
    </>
  );
}

export default DelegationsContainer;
