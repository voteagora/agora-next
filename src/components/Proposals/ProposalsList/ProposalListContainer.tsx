"use client";

import { cn } from "@/lib/utils";
import { useAccount } from "wagmi";
import Tenant from "@/lib/tenant/tenant";
import { DaoSlug } from "@prisma/client";
import ProposalsFilter from "@/components/Proposals/ProposalsFilter/ProposalsFilter";
import DraftProposalsFilter from "@/components/Proposals/ProposalsFilter/DraftProposalsFilter";
import CreateProposalDraftButton from "./CreateProposalDraftButton";
import { useSearchParams, useRouter } from "next/navigation";
import { useAddSearchParam } from "@/hooks/useAddSearchParam";
import { useDeleteSearchParams } from "@/hooks/useDeleteSearchParam";
import DraftProposalsSort from "../ProposalsFilter/DraftProposalsSort";

enum ProposalListTab {
  ALL = "all",
  DRAFT = "draft",
  MY_DRAFTS = "my-drafts",
}

const ProposalListContainer = ({
  allProposalsListElement,
  draftProposalsListElement,
  myDraftProposalsListElement,
}: {
  allProposalsListElement: React.ReactNode;
  draftProposalsListElement: React.ReactNode;
  myDraftProposalsListElement: React.ReactNode;
}) => {
  const router = useRouter();
  const addSearchParam = useAddSearchParam();
  const deleteSearchParams = useDeleteSearchParams();

  const { address } = useAccount();
  const { ui, slug } = Tenant.current();
  let tenantSupportsProposalLifecycle =
    ui.toggle("proposal-lifecycle")?.enabled;

  if (slug === DaoSlug.OP) {
    tenantSupportsProposalLifecycle =
      address === "0xe538f6f407937ffDEe9B2704F9096c31c64e63A8" || false;
  }

  const searchParams = useSearchParams();
  const activeTab = searchParams?.get("tab") ?? ProposalListTab.ALL;
  const clearFiltersAndSetTab = (tab: ProposalListTab) => {
    if (tab === ProposalListTab.ALL) {
      router.push(deleteSearchParams(["tab", "filter"]));
    } else {
      router.push(addSearchParam({ name: "tab", value: tab }), {
        scroll: false,
      });
    }
  };

  return (
    <div className="flex flex-col max-w-[76rem]">
      <div className="flex flex-col sm:flex-row justify-between items-baseline gap-2 mb-2 sm:mb-auto">
        <div className="flex flex-col sm:flex-row justify-between gap-4 w-full items-center mt-6 sm:mt-0">
          <div className="flex flex-row space-x-4">
            <button
              type="button"
              className={cn(
                "sm:text-2xl font-extrabold mb-0",
                activeTab === ProposalListTab.ALL
                  ? "text-primary"
                  : "text-primary/40 hover:text-primary/80 transition-colors"
              )}
              onClick={() => clearFiltersAndSetTab(ProposalListTab.ALL)}
            >
              All proposals
            </button>
            <button
              type="button"
              className={cn(
                "sm:text-2xl font-extrabold mb-0",
                activeTab === ProposalListTab.DRAFT
                  ? "text-primary"
                  : "text-primary/40 hover:text-primary/80 transition-colors"
              )}
              onClick={() => clearFiltersAndSetTab(ProposalListTab.DRAFT)}
            >
              Unsponsored
            </button>
            <button
              type="button"
              className={cn(
                "sm:text-2xl font-extrabold mb-0",
                activeTab === ProposalListTab.MY_DRAFTS
                  ? "text-primary"
                  : "text-primary/40 hover:text-primary/80 transition-colors"
              )}
              onClick={() => clearFiltersAndSetTab(ProposalListTab.MY_DRAFTS)}
            >
              My drafts
            </button>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-4 items-center flex-1 w-full sm:w-fit">
            {activeTab === ProposalListTab.ALL && <ProposalsFilter />}
            {activeTab === ProposalListTab.DRAFT && (
              <>
                <DraftProposalsFilter />
                <DraftProposalsSort />
              </>
            )}
            {tenantSupportsProposalLifecycle && address && (
              <CreateProposalDraftButton
                address={address}
                className="w-full sm:w-fit"
              />
            )}
          </div>
        </div>
      </div>
      <section className="mt-4" key={activeTab}>
        {activeTab === ProposalListTab.ALL && allProposalsListElement}
        {activeTab === ProposalListTab.DRAFT && draftProposalsListElement}
        {activeTab === ProposalListTab.MY_DRAFTS && myDraftProposalsListElement}
      </section>
    </div>
  );
};

export default ProposalListContainer;
