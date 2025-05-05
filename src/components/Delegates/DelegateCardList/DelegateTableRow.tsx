"use client";

import { DelegateProfileImage } from "../DelegateCard/DelegateProfileImage";
import { formatNumber } from "@/lib/tokenUtils";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { TableCell, TableRow } from "@/components/ui/table";
import { useVoterStats } from "@/hooks/useVoterStats";
import { useRouter } from "next/navigation";
import { DelegationSelector } from "../DelegateCard/DelegationSelector";
import { DelegateSocialLinks } from "../DelegateCard/DelegateSocialLinks";

export default function DelegateTableRow({
  delegate,
  isAdvancedUser,
  delegators,
}: {
  delegate: DelegateChunk & { numOfDelegators: bigint };
  isAdvancedUser: boolean;
  delegators: string[] | null;
}) {
  const router = useRouter();
  const { data: voterStats, isPending: isVoterStatsPending } = useVoterStats({
    address: delegate.address as `0x${string}`,
  });
  const twitter = delegate?.statement?.twitter;
  const discord = delegate?.statement?.discord;
  const warpcast = delegate?.statement?.warpcast;

  const numProposals = voterStats?.total_proposals || 0;
  const participation = Number(
    Math.round(
      ((voterStats?.last_10_props || 0) / Math.min(10, numProposals)) *
        100 *
        100
    ) / 100
  ).toFixed(2);

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
        {!isVoterStatsPending && numProposals > 0 && `${participation}%`}
      </TableCell>
      {/* @ts-ignore */}
      <TableCell>
        {delegate.numOfDelegators?.toString() || 0} addresses
      </TableCell>
      <TableCell className="justify-start">
        <DelegateSocialLinks
          discord={discord}
          twitter={twitter}
          warpcast={warpcast}
        />
      </TableCell>
      <TableCell>
        <DelegationSelector
          delegate={delegate}
          isAdvancedUser={isAdvancedUser}
          delegators={delegators}
        />
      </TableCell>
    </TableRow>
  );
}
