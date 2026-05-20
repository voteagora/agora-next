"use client";

import { Link, useSearch } from "@tanstack/react-router";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { buildDraftUrl } from "../utils/shareParam";

const BackButton = ({
  draftProposalId,
  index,
}: {
  draftProposalId: string | number;
  index: number;
}) => {
  const { share: shareParam } = useSearch({ strict: false }) as Record<
    string,
    string | undefined
  >;

  return (
    <Link
      className="cursor-pointer border border-line rounded-full p-1 w-8 h-8 flex items-center justify-center shadow-newDefault"
      to={buildDraftUrl(draftProposalId, index - 1, shareParam) as never}
    >
      <ChevronLeftIcon className="h-6 w-6 text-secondary" />
    </Link>
  );
};

export default BackButton;
