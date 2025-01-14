"use client";

import { DelegateProfileImage } from "../DelegateCard/DelegateProfileImage";
import { formatNumber } from "@/lib/tokenUtils";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { TableCell, TableRow } from "@/components/ui/table";
import { useVotingStats } from "@/hooks/useVotingStats";
import { useRouter } from "next/navigation";

export default function DelegateTableRow({
  delegate,
}: {
  delegate: DelegateChunk;
}) {
  const router = useRouter();
  const { data: votingStats, isPending: isVotingStatsPending } = useVotingStats(
    {
      address: delegate.address as `0x${string}`,
    }
  );

  return (
    <TableRow
      className="font-semibold cursor-pointer"
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
        {!isVotingStatsPending && `${(votingStats?.last_10_props || 0) * 10}%`}
      </TableCell>
      {/* @ts-ignore */}
      <TableCell>
        {delegate.numOfDelegators?.toString() || 0} addresses
      </TableCell>
      <TableCell>
        <div className="flex flex-row gap-2">
          <span className="text-positive font-bold border border-line rounded-md px-2 py-1">
            0
          </span>
          <span className="text-negative font-bold border border-line rounded-md px-2 py-1">
            0
          </span>
          <span className="text-tertiary font-bold border border-line rounded-md px-2 py-1">
            0
          </span>
        </div>
      </TableCell>
    </TableRow>
  );
}
