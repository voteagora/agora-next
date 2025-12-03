"use client";

import { Users } from "lucide-react";
import { QuickReferenceCard } from "@/components/shared/QuickReferenceCard";
import Tenant from "@/lib/tenant/tenant";

export default function SyndicateVotersPageContent() {
  const { ui } = Tenant.current();
  const useNeutral =
    ui.toggle("syndicate-colours-fix-delegate-pages")?.enabled ?? false;

  return (
    <QuickReferenceCard
      icon={Users}
      title="Voting Power Quick Guide"
      learnMoreHref="/help#voting-power"
      learnMoreText="How it works"
      variant={useNeutral ? "neutral" : "default"}
      className="mb-8"
    >
      <p>
        SYND tokens = voting power. Choose: self-delegate to vote yourself, or
        delegate to a trusted member.
      </p>
    </QuickReferenceCard>
  );
}
