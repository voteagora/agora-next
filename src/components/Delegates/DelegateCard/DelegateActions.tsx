"use client";

import { DelegateSocialLinks } from "./DelegateSocialLinks";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import Tenant from "@/lib/tenant/tenant";
import { DelegationSelector } from "./DelegationSelector";

export function DelegateActions({
  delegate,
  isAdvancedUser,
  delegators,
}: {
  delegate: DelegateChunk;
  isAdvancedUser: boolean;
  delegators: string[] | null;
}) {
  const twitter = delegate?.statement?.twitter;
  const discord = delegate?.statement?.discord;
  const warpcast = delegate?.statement?.warpcast;

  const { ui } = Tenant.current();
  const isRetired = ui.delegates?.retired.includes(
    delegate.address.toLowerCase() as `0x${string}`
  );

  if (isRetired) {
    return (
      <div className="rounded-lg border border-line p-2 bg-line text-xs font-medium text-secondary">
        This voter has stepped down. If you are currently delegated to them,
        please select a new voter.
      </div>
    );
  }

  return (
    <div className="flex flex-row items-stretch justify-between">
      <DelegateSocialLinks
        discord={discord}
        twitter={twitter}
        warpcast={warpcast}
      />
      <DelegationSelector
        delegate={delegate}
        isAdvancedUser={isAdvancedUser}
        delegators={delegators}
      />
    </div>
  );
}
