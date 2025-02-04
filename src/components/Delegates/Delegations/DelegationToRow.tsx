"use client";

import { Delegation } from "@/app/api/common/delegations/delegation";
import { TableCell, TableRow } from "@/components/ui/table";
import { getBlockScanUrl, TokenAmountDisplay } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import ENSName from "@/components/shared/ENSName";
import { DELEGATION_MODEL } from "@/lib/constants";

export default function DelegationToRow({
  delegation,
  delegationModel,
}: {
  delegation: Delegation;
  delegationModel: string;
}) {
  return (
    <TableRow>
      {(delegationModel === DELEGATION_MODEL.PARTIAL ||
        delegationModel === DELEGATION_MODEL.ADVANCED) && (
        <TableCell>
          {TokenAmountDisplay({
            amount: delegation.allowance,
            maximumSignificantDigits: 3,
          })}{" "}
        </TableCell>
      )}
      <TableCell>{format(delegation.timestamp || 0, "MM/dd/yyyy")}</TableCell>
      <TableCell>
        <Link
          href={`/delegates/${delegation.to}`}
          title={`Address ${delegation.to}`}
        >
          <ENSName address={delegation.to} />
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
