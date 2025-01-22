"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";
import { useDirection } from "../[id]/components/AnimationDirectionProvider";

const BackButton = ({
  draftProposalId,
  index,
}: {
  draftProposalId: number;
  index: number;
}) => {
  const router = useRouter();
  const { setDirection } = useDirection();
  return (
    <button
      className="cursor-pointer border border-line rounded-full p-1 w-8 h-8 flex items-center justify-center shadow-newDefault"
      type="button"
      onClick={() => {
        setDirection("prev");
        router.push(`/proposals/draft/${draftProposalId}?stage=${index - 1}`);
      }}
    >
      <ChevronLeftIcon className="h-6 w-6 text-secondary" />
    </button>
  );
};

export default BackButton;
