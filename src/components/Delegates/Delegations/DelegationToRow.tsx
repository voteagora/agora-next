import { Delegation } from "@/app/api/delegations/delegation";

function DelegationToRow({ delegation }: { delegation: Delegation }) {
  return (
    <div>
      <div>
        <div>{delegation.allowance}</div>
        <div>{delegation.timestamp?.toString() || "unknown"}</div>
      </div>
      <div>
        <div>{delegation.type}</div>
        <div>{delegation.amount}</div>
      </div>
      <div>{delegation.to}</div>
    </div>
  );
}

export default DelegationToRow;
