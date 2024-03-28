import { processAddressOrEnsName } from "@/app/lib/ENSUtils";
import { icons } from "@/icons/icons";
import { ProposalDraft } from "@prisma/client";
import Image from "next/image";
import React, { useEffect, useState } from "react";

interface DraftProposalSponsorNoteProps {
  proposal: ProposalDraft;
}

const DraftProposalSponsorNote: React.FC<DraftProposalSponsorNoteProps> = (
  props
) => {
  const { proposal } = props;

  const [sponsorName, setSponsorName] = useState<string>("");
  const [authorName, setAuthorName] = useState<string>("");

  const fetchSponsorName = async (sponsorAddress: string) => {
    const name = await processAddressOrEnsName(sponsorAddress);
    setSponsorName(name || "");
  };

  const fetchAuthorName = async (authorAddress: string) => {
    const name = await processAddressOrEnsName(authorAddress);
    setAuthorName(name || "");
  };

  useEffect(() => {
    if (!proposal.sponsor_address) return;
    fetchSponsorName(proposal.sponsor_address);
    fetchAuthorName(proposal.author_address);
  }, [proposal]);

  return (
    <div className="flex flex-col gap-y-4 w-[350px] flex-shrink-0 bg-[#FAFAF2] rounded-2xl ring-inset ring-1 ring-[#ECE3CA] text-[#B16B19] p-6">
      <div className="flex flex-row items-center">
        <div className="p-2 border rounded-md border-[#ECE3CA] flex-shrink-0 mr-3 shadow-sm">
          <Image
            src={icons.usersEdit}
            alt="Upload icon"
            width={24}
            height={24}
          />
        </div>
        <h2 className="font-semibold">
          {sponsorName} would like your help to submit this proposal
        </h2>
      </div>
      <p className="opacity-70">
        The proposer has created a draft proposal, but might not meet the
        proposal threshold to submit it themselves. They’d like you to help them
        submit it.
      </p>
      <p className="opacity-70">
        If you choose to do so, this proposal will be marked as “submitted by{" "}
        {sponsorName}, authored by {authorName}”
      </p>
    </div>
  );
};

export default DraftProposalSponsorNote;
