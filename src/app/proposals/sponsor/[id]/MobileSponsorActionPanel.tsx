"use client";

import { useState } from "react";
import { ProposalDraftApprovedSponsors } from "@prisma/client";
import SponsorActionPanel from "../components/SponsorActionPanel";
import { DraftProposal } from "../../draft/types";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const MobileSponsorActionPanel = ({
  draftProposal,
}: {
  draftProposal: DraftProposal & {
    approved_sponsors: ProposalDraftApprovedSponsors[];
  };
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
      <motion.div
        className={cn(
          "block sm:hidden fixed bottom-0 left-0 w-[calc(100%)] p-4 border border-line bg-neutral rounded-t-2xl shadow-newDefault z-50",
          isOpen ? "overflow-y-auto" : "overflow-y-hidden"
        )}
        initial={{ height: "200px" }}
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
    </>
  );
};

export default MobileSponsorActionPanel;
