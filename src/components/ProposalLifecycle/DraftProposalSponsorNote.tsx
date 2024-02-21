import { icons } from "@/icons/icons";
import Image from "next/image";
import React from "react";

const DraftProposalSponsorNote: React.FC = () => {
  return (
    <div className="w-[350px] flex-shrink-0 bg-[#FAFAF2] rounded-2xl ring-inset ring-1 ring-[#ECE3CA] text-[#B16B19] p-6">
      <div className="flex flex-row items-center mb-4">
        <div className="p-2 border rounded-md border-[#ECE3CA] flex-shrink-0 mr-3">
          <Image
            src={icons.usersEdit}
            alt="Upload icon"
            width={24}
            height={24}
          />
        </div>
        <h2 className="font-semibold">
          kartpatkey.eth would like your help to submit this proposal
        </h2>
      </div>
      <p className="opacity-70">
        The proposer has created a draft proposal, but might not meet the
        proposal threshold to submit it themselves. They’d like you to help them
        submit it. If you choose to do so, this proposal will be marked as
        “submitted by nick.eth, authored by kartpatkey.eth”
      </p>
    </div>
  );
};

export default DraftProposalSponsorNote;
