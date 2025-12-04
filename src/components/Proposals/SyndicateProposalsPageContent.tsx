"use client";

import { DismissableBanner } from "@/components/shared/DismissableBanner";
import { BookOpen } from "lucide-react";

export default function SyndicateProposalsPageContent() {
  return (
    <DismissableBanner
      storageKey="proposals-voting-process-banner-dismissed"
      icon={BookOpen}
      message="New to governance?"
      linkText="Learn about the voting process"
      linkHref="/info#voting-process"
      variant="table-header"
    />
  );
}
