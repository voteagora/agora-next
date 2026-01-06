"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { buildDraftUrl } from "../utils/shareParam";

const BackButton = ({
  draftProposalId,
  index,
}: {
  draftProposalId: string | number;
  index: number;
}) => {
  const searchParams = useSearchParams();
  const shareParam = searchParams?.get("share");

  return (
    <Link
      className="cursor-pointer border border-line rounded-full p-1 w-8 h-8 flex items-center justify-center shadow-newDefault"
      href={buildDraftUrl(draftProposalId, index - 1, shareParam)}
    >
      <ChevronLeftIcon className="h-6 w-6 text-secondary" />
    </Link>
  );
};

export default BackButton;
