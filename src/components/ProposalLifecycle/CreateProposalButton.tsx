"use client";

import Link from "next/link";

export default function CreateProposalButton() {
  return (
    <Link
      href="/proposals/create-draft"
      className={`w-full md:w-fit bg-stone-900 text-white text-base font-medium border border-stone-100 rounded-full py-2 px-4 flex items-center`}
    >
      Create Proposal
    </Link>
  );
}
