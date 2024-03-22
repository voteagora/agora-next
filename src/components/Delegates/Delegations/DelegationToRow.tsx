"use client";

import { Delegation } from "@/app/api/common/delegations/delegation";
import HumanAddress from "@/components/shared/HumanAddress";
import { TableCell, TableRow } from "@/components/ui/table";
import { TokenAmountDisplay } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";

export default function DelegationToRow({
  delegation,
}: {
  delegation: Delegation;
}) {
  return (
    <TableRow>
      <TableCell>
        {TokenAmountDisplay(delegation.allowance, 18, "OP", 3)}
      </TableCell>
      <TableCell>{format(delegation.timestamp || 0, "MM/dd/yyyy")}</TableCell>
      <TableCell>{delegation.type}</TableCell>
      <TableCell>{delegation.amount}</TableCell>
      <TableCell>
        <Link
          href={`/delegates/${delegation.to}`}
          title={`Address ${delegation.to}`}
        >
          <HumanAddress address={delegation.to} />
        </Link>
      </TableCell>
    </TableRow>
  );
}
