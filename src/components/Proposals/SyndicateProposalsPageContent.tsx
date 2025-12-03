"use client";

import { Vote } from "lucide-react";
import { QuickReferenceCard } from "@/components/shared/QuickReferenceCard";

export default function SyndicateProposalsPageContent() {
  return (
    <QuickReferenceCard
      icon={Vote}
      title="Governance Process"
      learnMoreHref="/help#voting-process"
      learnMoreText="View detailed process"
      variant="neutral"
      className="mb-6"
    >
      <ul className="list-disc list-outside space-y-1.5 ml-4">
        <li>
          <strong>Temp-Check (5 days):</strong> 5% support required to advance
        </li>
        <li>
          <strong>Governance Vote (7 days):</strong> Majority + 10%
          participation to pass
        </li>
        <li>
          <strong>Rules Committee (3 days):</strong> Legal/technical review
          before enactment
        </li>
      </ul>
    </QuickReferenceCard>
  );
}
