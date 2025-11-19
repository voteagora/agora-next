"use client";

import DismissibleBanner from "@/components/shared/DismissibleBanner";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface SyndicateProposalsPageContentProps {
  attachedToCard?: boolean;
}

export default function SyndicateProposalsPageContent({
  attachedToCard = false,
}: SyndicateProposalsPageContentProps) {
  return (
    <DismissibleBanner
      id="syndicate-proposals-voting-process"
      icon={<BookOpenIcon className="w-4 h-4 text-secondary" />}
      attachedToCard={attachedToCard}
    >
      Proposals go through a 5-day Temp-Check, 7-day Member Vote, then Rules
      Committee review.{" "}
      <Link href="/info#voting-process" className="text-link hover:underline">
        Learn how proposals work
      </Link>
    </DismissibleBanner>
  );
}
