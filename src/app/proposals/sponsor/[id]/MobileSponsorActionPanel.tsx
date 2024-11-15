"use client";

import { useState } from "react";
import { ProposalDraftApprovedSponsors } from "@prisma/client";
import SponsorActionPanel from "../components/SponsorActionPanel";
import { DraftProposal } from "../../draft/types";
import { ArrowUpIcon } from "@heroicons/react/20/solid";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const MobileSponsorActionPanel = ({
  draftProposal,
}: {
  draftProposal: DraftProposal & {
    approved_sponsors: ProposalDraftApprovedSponsors[];
  };
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div
      className={cn(
        "block sm:hidden absolute bottom-0 w-[calc(100%-2rem)] p-4 border border-line rounded-t-lg bg-neutral shadow-newDefault",
        isOpen ? "overflow-y-auto" : "overflow-y-hidden"
      )}
      animate={{ height: isOpen ? "600px" : "200px" }}
      transition={{ duration: 0.3, ease: [0.175, 0.885, 0.32, 1] }}
    >
      <div
        className="flex items-center justify-center cursor-pointer rounded-t-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="h-1.5 w-[100px] bg-tertiary rounded-lg mb-4"></span>
      </div>
      <SponsorActionPanel draftProposal={draftProposal} />
      <div className="h-[80px]"></div>
    </motion.div>
  );
};

export default MobileSponsorActionPanel;
