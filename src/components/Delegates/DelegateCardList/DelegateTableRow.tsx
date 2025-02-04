"use client";

import { DelegateProfileImage } from "../DelegateCard/DelegateProfileImage";
import { formatNumber } from "@/lib/tokenUtils";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { TableCell, TableRow } from "@/components/ui/table";
import { useVoterStats } from "@/hooks/useVoterStats";
import { useRouter } from "next/navigation";

export default function DelegateTableRow({
  delegate,
}: {
  delegate: DelegateChunk & { numOfDelegators: bigint };
}) {
  const router = useRouter();
  const { data: voterStats, isPending: isVoterStatsPending } = useVoterStats({
    address: delegate.address as `0x${string}`,
  });

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
        {!isVoterStatsPending && `${(voterStats?.last_10_props || 0) * 10}%`}
      </TableCell>
      {/* @ts-ignore */}
      <TableCell>
        {delegate.numOfDelegators?.toString() || 0} addresses
      </TableCell>
    </TableRow>
  );
}
