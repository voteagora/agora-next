"use client";

import { Delegation } from "@/app/api/delegations/delegation";
import HumanAddress from "@/components/shared/HumanAddress";
import { TableCell, TableRow } from "@/components/ui/table";
import { TokenAmountDisplay } from "@/lib/utils";
import { format } from "date-fns";

export default function DelegationFromRow({
  delegation,
  relationship,
}: {
  delegation: Delegation;
  relationship: "from" | "to";
}) {
  return (
    <TableRow>
      <TableCell>
        {TokenAmountDisplay(delegation.allowance, 18, "OP", 6)}
      </TableCell>
      <TableCell>{format(delegation.timestamp || 0, "MM/dd/yyyy")}</TableCell>
      <TableCell>{delegation.type}</TableCell>
      <TableCell>{delegation.amount}</TableCell>
      <TableCell>
        <HumanAddress address={delegation[relationship]} />
      </TableCell>
    </TableRow>
  );
}
