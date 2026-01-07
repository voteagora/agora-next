import { IdentityBadge } from "@/app/api/common/badges/getBadges";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Shield, BadgeCheck, Wallet, Users, Eye, Info } from "lucide-react";
import Link from "next/link";

type DelegateBadgesProps = {
  badges: IdentityBadge[];
};

const MAX_VISIBLE_BADGES = 7;

function BadgeIcon({ name }: { name: string }) {
  const lowerName = name.toLowerCase();

  if (lowerName.includes("security") || lowerName.includes("council")) {
    return <Shield className="w-5 h-5" />;
  }

  if (
    lowerName.includes("verified") ||
    lowerName.includes("human") ||
    lowerName.includes("developer")
  ) {
    return <BadgeCheck className="w-5 h-5" />;
  }

  if (
    lowerName.includes("grants") ||
    lowerName.includes("treasury") ||
    lowerName.includes("governance")
  ) {
    return <Wallet className="w-5 h-5" />;
  }

  if (lowerName.includes("top") || lowerName.includes("rank")) {
    return <Users className="w-5 h-5" />;
  }

  if (lowerName.includes("eye") || lowerName.includes("watch")) {
    return <Eye className="w-5 h-5" />;
  }

  return <Info className="w-5 h-5" />;
}

function getBadgeStyle(name: string, index: number) {
  const lowerName = name.toLowerCase();
  const styles = [
    "border-[#E85D75] text-[#E85D75] bg-white",
    "border-[#8B7AA8] text-[#8B7AA8] bg-white",
    "border-[#6B9E78] text-[#6B9E78] bg-white",
    "border-[#7AA8C7] text-[#7AA8C7] bg-white",
    "border-[#D4A373] text-[#D4A373] bg-white",
  ];

  if (lowerName.includes("top") && index === 0) {
    return "border-dashed border-[#E85D75] text-[#E85D75] bg-white";
  }

  if (lowerName.includes("verified") || lowerName.includes("human")) {
    return "border-[#E85D75] text-[#E85D75] bg-white";
  }

  return styles[index % styles.length];
}

export function DelegateBadges({ badges }: DelegateBadgesProps) {
  if (!badges || badges.length === 0) {
    return null;
  }

  const activeBadges = badges.filter((badge) => {
    const now = BigInt(Math.floor(Date.now() / 1000));
    const expirationTime = badge.expiration_time;
    return expirationTime === BigInt(0) || expirationTime > now;
  });

  if (activeBadges.length === 0) {
    return null;
  }

  const visibleBadges = activeBadges.slice(0, MAX_VISIBLE_BADGES);
  const remainingCount = activeBadges.length - MAX_VISIBLE_BADGES;

  return (
    <div className="flex flex-wrap gap-y-3.5 gap-x-8 -ml-4 -mr-12">
      {visibleBadges.map((badge, index) => {
        const seed = parseInt(badge.badge_definition_id, 10) || index;
        const rotation = ((seed * 2654435761) % 100) / 15 - 3.5;

        return (
          <TooltipProvider key={badge.badge_definition_id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={`/badges/${badge.badge_definition_id}`}
                  className={`inline-flex items-center gap-2 px-4 py-3 border-2 rounded-full cursor-pointer transition-all hover:scale-105 flex-shrink-0 shadow-sm ${getBadgeStyle(badge.definition.name, index)}`}
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  <BadgeIcon name={badge.definition.name} />
                  <span className="text-base font-medium whitespace-nowrap">
                    {badge.definition.name}
                  </span>
                </Link>
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px] p-4 rounded-xl bg-black text-neutral shadow-xl">
                <div className="flex flex-col gap-2">
                  <span className="font-semibold text-white">
                    {badge.definition.name}
                  </span>
                  <span className="text-sm text-neutral-300">
                    {badge.definition.description}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-neutral-400 mt-2 pt-2 border-t border-neutral-700">
                    <span>
                      Issued:{" "}
                      {new Date(
                        Number(badge.attestation_time) * 1000
                      ).toLocaleDateString()}
                    </span>
                    {badge.expiration_time !== BigInt(0) && (
                      <span>
                        • Expires:{" "}
                        {new Date(
                          Number(badge.expiration_time) * 1000
                        ).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
      {remainingCount > 0 && (
        <div className="inline-flex items-center justify-center px-4 py-3 border-2 border-line text-secondary bg-white rounded-full text-base font-medium flex-shrink-0 shadow-sm">
          +{remainingCount} more
        </div>
      )}
    </div>
  );
}
