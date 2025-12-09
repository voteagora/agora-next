"use client";

import { DelegateProfileImage } from "../DelegateCard/DelegateProfileImage";
import { formatNumber } from "@/lib/tokenUtils";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { TableCell, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { DelegationSelector } from "../DelegateCard/DelegationSelector";
import { DelegateSocialLinks } from "../DelegateCard/DelegateSocialLinks";

export default function DelegateTableRow({
  delegate,
  isAdvancedUser,
  delegators,
  showParticipation,
  show7dChange,
}: {
  delegate: DelegateChunk & {
    numOfDelegators: bigint;
    vpChange7d?: string;
    participation: number;
  };
  isAdvancedUser: boolean;
  delegators: string[] | null;
  showParticipation: boolean;
  show7dChange: boolean;
}) {
  const router = useRouter();

  const twitter = delegate?.statement?.twitter;
  const discord = delegate?.statement?.discord;
  const warpcast = delegate?.statement?.warpcast;

  return (
    <TableRow
      className="font-semibold cursor-pointer bg-neutral text-secondary"
      onClick={() => {
        router.push(`/delegates/${delegate.address}`);
      }}
    >
      <TableCell>
        <div className="w-64">
          <DelegateProfileImage
            truncateText
            endorsed={delegate.statement?.endorsed}
            address={delegate.address}
            votingPower={delegate.votingPower.total}
          />
        </div>
      </TableCell>
      <TableCell>{formatNumber(delegate.votingPower.total)}</TableCell>
      {show7dChange && (
        <TableCell>
          {delegate.vpChange7d ? (
            <span
              className={
                Number(delegate.vpChange7d) > 0
                  ? "text-green-500"
                  : Number(delegate.vpChange7d) < 0
                    ? "text-red-500"
                    : "text-secondary"
              }
            >
              {Number(delegate.vpChange7d) > 0 ? "+" : ""}
              {formatNumber(delegate.vpChange7d)}
            </span>
          ) : (
            "0"
          )}
        </TableCell>
      )}
      {showParticipation && (
        <TableCell>{`${Math.round(delegate.participation)}%`}</TableCell>
      )}
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
