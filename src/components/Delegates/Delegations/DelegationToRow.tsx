"use client";

import { Delegation } from "@/app/api/common/delegations/delegation";
import { TableCell, TableRow } from "@/components/ui/table";
import { getBlockScanUrl, TokenAmountDisplay } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import ENSName from "@/components/shared/ENSName";

export default function DelegationToRow({
  delegation,
  tokenBalance,
}: {
  delegation: Delegation;
  tokenBalance?: bigint;
}) {
  return (
    <TableRow>
      <TableCell>
        {TokenAmountDisplay({
          amount: tokenBalance ? tokenBalance : "0",
          maximumSignificantDigits: 3,
        })}{" "}
      </TableCell>
      <TableCell>{format(delegation.timestamp || 0, "yyyy/MM/dd")}</TableCell>
      <TableCell>
        <Link
          href={`/delegates/${delegation.to}`}
          title={`Address ${delegation.to}`}
        >
          <ENSName address={delegation.to} includeCtoC={true} />
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
