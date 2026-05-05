"use client";

import { Delegation } from "@/app/api/common/delegations/delegation";
import { TableCell, TableRow } from "@/components/ui/table";
import { getBlockScanUrl, TokenAmountDisplay } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import ENSName from "@/components/shared/ENSName";
import { useBnAndTidToHash } from "@/hooks/useBnAndTidToHash";
import { useInView } from "react-intersection-observer";

export default function DelegationFromRow({
  delegation,
}: {
  delegation: Delegation;
}) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { data: resolvedHash } = useBnAndTidToHash({
    blockNumber: delegation.block_number,
    transactionIndex: delegation.transaction_index,
    enabled: inView && !delegation.transaction_hash,
  });

  const txHash = delegation.transaction_hash || resolvedHash;

  return (
    <TableRow ref={ref}>
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
        {txHash ? (
          <a
            href={getBlockScanUrl(txHash)}
            target="_blank"
            rel="noreferrer noopener"
          >
            View
            <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2 inline align-text-bottom" />
          </a>
        ) : (
          <span className="text-secondary">N/A</span>
        )}
      </TableCell>
    </TableRow>
  );
}
