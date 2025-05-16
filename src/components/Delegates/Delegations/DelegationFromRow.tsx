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

  const { data: hash, isPending } = useBnAndTidToHash({
    blockNumber: delegation.bn,
    transactionIndex: delegation.tid,
    enabled: inView && !!delegation.bn && !!delegation.tid,
  });

  return (
    <TableRow ref={ref}>
      <TableCell>
        {TokenAmountDisplay({
          amount: delegation.allowance,
          maximumSignificantDigits: 3,
        })}
      </TableCell>
      <TableCell>
        {delegation.timestamp
          ? format(delegation.timestamp, "MM/dd/yyyy")
          : "Not Found"}
      </TableCell>
      <TableCell>
        <Link
          href={`/delegates/${delegation.from}`}
          title={`Address ${delegation.from}`}
        >
          <ENSName address={delegation.from} />
        </Link>
      </TableCell>
      <TableCell>
        {delegation.transaction_hash || hash ? (
          <a
            href={getBlockScanUrl(
              delegation.transaction_hash ?? (hash as `0x${string}`)
            )}
            target="_blank"
            rel="noreferrer noopener"
          >
            View
            <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2 inline align-text-bottom" />
          </a>
        ) : isPending ? (
          "Loading..."
        ) : (
          "Not Found"
        )}
      </TableCell>
    </TableRow>
  );
}
