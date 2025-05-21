"use client";

import { DelegateProfileImage } from "../DelegateCard/DelegateProfileImage";
import { formatNumber } from "@/lib/tokenUtils";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { TableCell, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";

export default function DelegateTableRow({
  delegate,
}: {
  delegate: DelegateChunk & {
    numOfDelegators: bigint;
    vpChange7d?: string;
    participation: number;
  };
}) {
  const router = useRouter();

  return (
    <TableRow
      className="font-semibold cursor-pointer bg-neutral text-secondary"
      onClick={() => {
        router.push(`/delegates/${delegate.address}`);
      }}
    >
      <TableCell>
        <DelegateProfileImage
          endorsed={delegate.statement?.endorsed}
          address={delegate.address}
          votingPower={delegate.votingPower.total}
          citizen={delegate.citizen}
        />
      </TableCell>
      <TableCell>{formatNumber(delegate.votingPower.total)}</TableCell>
      <TableCell>
        {delegate.vpChange7d ? (
          <span
            className={
              Number(delegate.vpChange7d) >= 0
                ? "text-green-500"
                : "text-red-500"
            }
          >
            {Number(delegate.vpChange7d) >= 0 ? "+" : ""}
            {formatNumber(delegate.vpChange7d)}
          </span>
        ) : (
          "0"
        )}
      </TableCell>
      <TableCell>{`${Math.round(delegate.participation)}%`}</TableCell>
      {/* @ts-ignore */}
      <TableCell>
        {delegate.numOfDelegators?.toString() || 0} addresses
      </TableCell>
    </TableRow>
  );
}
