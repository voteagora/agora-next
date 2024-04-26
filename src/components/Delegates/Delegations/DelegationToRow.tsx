"use client";

import { Delegation } from "@/app/api/common/delegations/delegation";
import HumanAddress from "@/components/shared/HumanAddress";
import { TableCell, TableRow } from "@/components/ui/table";
import { TokenAmountDisplay } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { getBlockScanUrl } from "@/lib/utils";

export default function DelegationToRow({
  delegation,
}: {
  delegation: Delegation;
}) {
  return (
    <TableRow>
      <TableCell>
        {TokenAmountDisplay({
          amount: delegation.allowance,
          maximumSignificantDigits: 3,
        })}{" "}
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
      <TableCell>
        <a
          href={getBlockScanUrl(
            "0x373685deb4e6cca8fb915eca177a4f741fc282fe4337797cfe52e9725afe63bf"
          )}
          target="_blank"
          rel="noreferrer noopener"
        >
          View
          <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2 inline align-text-bottom" />
        </a>
      </TableCell>
    </TableRow>
  );
}
