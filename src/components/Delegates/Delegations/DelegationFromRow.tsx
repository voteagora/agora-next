"use client";

import { Delegation } from "@/app/api/delegations/delegation";
import { HStack } from "@/components/Layout/Stack";
import HumanAddress from "@/components/shared/HumanAddress";
import { TokenAmountDisplay } from "@/lib/utils";
import { format } from "date-fns";

function DelegationFromRow({ delegation }: { delegation: Delegation }) {
  return (
    <HStack gap={2}>
      <div>{TokenAmountDisplay(delegation.allowance, 18, "OP", 6)}</div>
      <div>{format(delegation.timestamp || 0, "MM/dd/yyyy")}</div>
      <div>{delegation.type}</div>
      <div>{delegation.amount}</div>
      <HumanAddress address={delegation.from} />
    </HStack>
  );
}

export default DelegationFromRow;
