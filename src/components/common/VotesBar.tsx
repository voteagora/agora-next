import { rgbStringToHex } from "@/app/lib/utils/color";
import Tenant from "@/lib/tenant/tenant";
import { useMemo } from "react";

interface VoteBarProps {
  forVotes?: number;
  againstVotes: number;
  abstainVotes?: number;
  quorumPercentage?: number;
  showVotesPercentage?: boolean;
}

type VoteSegment = {
  type: "for" | "against" | "abstain";
  percentage: number;
  color: string;
};

export const VotesBar = ({
  forVotes,
  againstVotes,
  abstainVotes,
  quorumPercentage,
  showVotesPercentage,
}: VoteBarProps) => {
  const { ui } = Tenant.current();
  const { positive, negative, secondary } = ui.customization || {};

  const forColor = useMemo(
    () => (positive ? rgbStringToHex(positive) : "#4DE897"),
    [positive]
  );
  const againstColor = useMemo(
    () => (negative ? rgbStringToHex(negative) : "#FF5C57"),
    [negative]
  );
  const abstainColor = useMemo(
    () => (secondary ? rgbStringToHex(secondary) : "#FFC107"),
    [secondary]
  );

  const segments = useMemo<VoteSegment[]>(
    () =>
      [
        {
          type: "for" as const,
          percentage: forVotes || 0,
          color: forColor,
        },
        {
          type: "against" as const,
          percentage: againstVotes,
          color: againstColor,
        },
        {
          type: "abstain" as const,
          percentage: abstainVotes || 0,
          color: abstainColor,
        },
      ].filter((segment) => segment.percentage > 0),
    [forVotes, forColor, againstVotes, againstColor, abstainVotes, abstainColor]
  );

  return (
    <div className="p-4 border-b border-line">
      <div className="mb-4">
        {" "}
        {/* Adjusted margin for single bar context */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">Total Votes</div>
          {showVotesPercentage && (
            <div className="text-sm font-medium">{againstVotes}%</div>
          )}
        </div>
        {/* Single Vote bar */}
        <div className="relative h-3 rounded-sm overflow-hidden bg-line">
          {/* Vote segments */}
          <div className="absolute inset-0 flex">
            {segments.map((segment) => (
              <div
                key={segment.type}
                className="h-full"
                style={{
                  width: `${segment.percentage}%`,
                  backgroundColor: segment.color,
                }}
                aria-label={`${segment.type} votes: ${segment.percentage.toFixed(2)}%`}
              />
            ))}
          </div>

          {/* Quorum marker for this group's bar */}
          {quorumPercentage != null && quorumPercentage >= 0 && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-black"
              style={{ left: `${Math.min(quorumPercentage, 100)}%` }} // Cap at 100%
              aria-label={`Quorum threshold: ${quorumPercentage.toFixed(2)}%`}
            />
          )}
        </div>
      </div>
    </div>
  );
};
