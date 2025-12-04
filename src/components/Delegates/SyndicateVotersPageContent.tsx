"use client";

import { DismissableBanner } from "@/components/shared/DismissableBanner";
import { Vote } from "lucide-react";

export default function SyndicateVotersPageContent() {
  return (
    <DismissableBanner
      storageKey="delegates-voting-power-banner-dismissed"
      icon={Vote}
      message="Need help with delegation?"
      linkText="Learn how voting power works"
      linkHref="/info#voting-power"
      variant="table-header"
    />
  );
}
