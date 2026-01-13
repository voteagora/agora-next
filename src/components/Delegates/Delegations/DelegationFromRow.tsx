"use client";

import { Delegation } from "@/app/api/common/delegations/delegation";
import { TableCell, TableRow } from "@/components/ui/table";
import { getBlockScanUrl, TokenAmountDisplay } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import ENSName from "@/components/shared/ENSName";

export default function DelegationFromRow({
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
        })}
      </TableCell>
      <TableCell>{format(delegation.timestamp || 0, "yyyy/MM/dd")}</TableCell>
      <TableCell>
        <Link
          href={`/delegates/${delegation.from}`}
          title={`Address ${delegation.from}`}
        >
          <ENSName address={delegation.from} includeCtoC={true} />
        </Link>
      </TableCell>
      <TableCell>
        <a
          href={getBlockScanUrl(delegation.transaction_hash)}
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
