"use client";

import DismissibleBanner from "@/components/shared/DismissibleBanner";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface SyndicateVotersPageContentProps {
  attachedToCard?: boolean;
}

export default function SyndicateVotersPageContent({
  attachedToCard = false,
}: SyndicateVotersPageContentProps) {
  return (
    <DismissibleBanner
      id="syndicate-voters-voting-power"
      icon={<BookOpenIcon className="w-4 h-4 text-secondary" />}
      attachedToCard={attachedToCard}
    >
      Your tokens don't count as votes until you choose where your voting power
      lives: self-delegate or delegate to someone you trust.{" "}
      <Link href="/info#voting-power" className="text-link hover:underline">
        Learn about voting power
      </Link>
    </DismissibleBanner>
  );
}
