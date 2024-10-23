"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAccount } from "wagmi";
import Tenant from "@/lib/tenant/tenant";
import { DaoSlug } from "@prisma/client";
import ProposalsFilter from "@/components/Proposals/ProposalsFilter/ProposalsFilter";
import DraftProposalsFilter from "@/components/Proposals/ProposalsFilter/DraftProposalsFilter";
import CreateProposalDraftButton from "./CreateProposalDraftButton";
import { motion, AnimatePresence } from "framer-motion";

enum ProposalListTab {
  ALL = "all",
  DRAFT = "draft",
}

const ProposalListContainer = ({
  allProposalsListElement,
  draftProposalsListElement,
}: {
  allProposalsListElement: React.ReactNode;
  draftProposalsListElement: React.ReactNode;
}) => {
  const { address } = useAccount();
  const { ui, slug } = Tenant.current();
  let tenantSupportsProposalLifecycle =
    ui.toggle("proposal-lifecycle")?.enabled;

  if (slug === DaoSlug.OP) {
    tenantSupportsProposalLifecycle =
      address === "0xe538f6f407937ffDEe9B2704F9096c31c64e63A8" || false;
  }

  const [activeTab, setActiveTab] = useState<ProposalListTab>(
    ProposalListTab.ALL
  );

  return (
    <div className="flex flex-col max-w-[76rem]">
      <div className="flex flex-col sm:flex-row justify-between items-baseline gap-2 mb-4 sm:mb-auto">
        <div className="flex flex-row justify-between gap-4 w-full items-center">
          <div className="flex flex-row space-x-4">
            <button
              type="button"
              className={cn(
                "text-2xl font-extrabold mb-0",
                activeTab === ProposalListTab.ALL
                  ? "text-primary"
                  : "text-primary/40 hover:text-primary/80 transition-colors"
              )}
              onClick={() => setActiveTab(ProposalListTab.ALL)}
            >
              All proposals
            </button>
            <button
              type="button"
              className={cn(
                "text-2xl font-extrabold mb-0",
                activeTab === ProposalListTab.DRAFT
                  ? "text-primary"
                  : "text-primary/40 hover:text-primary/80 transition-colors"
              )}
              onClick={() => setActiveTab(ProposalListTab.DRAFT)}
            >
              Draft proposals
            </button>
          </div>
          <div className="flex flex-col sm:flex-row justify-between gap-4 w-full sm:w-fit items-center">
            {activeTab === ProposalListTab.ALL && <ProposalsFilter />}
            {activeTab === ProposalListTab.DRAFT && <DraftProposalsFilter />}
            {tenantSupportsProposalLifecycle && address && (
              <CreateProposalDraftButton address={address} />
            )}
          </div>
        </div>
      </div>
      <motion.section
        className="mt-4"
        key={activeTab}
        // initial={{ opacity: 0, y: -10 }}
        // animate={{ opacity: 1, y: 0 }}
        // exit={{ opacity: 0, y: 10 }}
        // transition={{ duration: 0.3, bounce: 0.2 }}
      >
        {activeTab === ProposalListTab.ALL && allProposalsListElement}
        {activeTab === ProposalListTab.DRAFT && draftProposalsListElement}
      </motion.section>
    </div>
  );
};

export default ProposalListContainer;
