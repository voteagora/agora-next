"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";

const BackButton = ({
  draftProposalId,
  index,
}: {
  draftProposalId: number;
  index: number;
}) => {
  return (
    <Link
      className="cursor-pointer border border-agora-stone-100 rounded-full p-1 w-8 h-8 flex items-center justify-center shadow-newDefault"
      href={`/proposals/draft/${draftProposalId}?stage=${index - 1}`}
    >
      <ChevronLeftIcon className="h-6 w-6 text-agora-stone-700" />
    </Link>
  );
};

export default BackButton;
