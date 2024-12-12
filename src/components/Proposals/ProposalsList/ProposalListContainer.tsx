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
import MyDraftsSort from "../ProposalsFilter/MyDraftsSort";
import useUnreadDraftCount from "@/hooks/useUnreadDraftCount";
import CurrentGovernanceStage from "../CurrentGovernanceStage/CurrentGovernanceStage";
import { AgoraLoaderSmall } from "@/components/shared/AgoraLoader/AgoraLoader";

enum ProposalListTab {
  ALL = "all",
  DRAFT = "draft",
  MY_DRAFTS = "my-drafts",
}

const ProposalListContainer = ({
  allProposalsListElement,
  draftProposalsListElement,
  myDraftProposalsListElement,
  governanceCalendar,
}: {
  allProposalsListElement: React.ReactNode;
  draftProposalsListElement: React.ReactNode;
  myDraftProposalsListElement: React.ReactNode;
  governanceCalendar: any;
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

  const { data: unreadDraftCount } = useUnreadDraftCount(address);
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
                "sm:text-xl mb-0",
                activeTab === ProposalListTab.ALL
                  ? "text-primary border-b-2 border-primary"
                  : "text-primary/40 hover:text-primary/80 transition-colors"
              )}
              onClick={() => clearFiltersAndSetTab(ProposalListTab.ALL)}
            >
              Proposals
            </button>
            <button
              type="button"
              className={cn(
                "sm:text-xl mb-0 flex flex-row gap-2 items-center",
                activeTab === ProposalListTab.DRAFT
                  ? "text-primary border-b-2 border-primary"
                  : "text-primary/40 hover:text-primary/80 transition-colors"
              )}
              onClick={() => clearFiltersAndSetTab(ProposalListTab.DRAFT)}
            >
              <span>Submissions</span>
              {!!unreadDraftCount && (
                <span className="text-xs text-secondary font-medium border border-line rounded px-1">
                  {unreadDraftCount.toString()}
                </span>
              )}
            </button>
            <button
              type="button"
              className={cn(
                "sm:text-xl mb-0",
                activeTab === ProposalListTab.MY_DRAFTS
                  ? "text-primary border-b-2 border-primary"
                  : "text-primary/40 hover:text-primary/80 transition-colors"
              )}
              onClick={() => clearFiltersAndSetTab(ProposalListTab.MY_DRAFTS)}
            >
              Drafts
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
            {activeTab === ProposalListTab.MY_DRAFTS && (
              <>
                <MyDraftsSort />
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
      {governanceCalendar && (
        <div className="mt-4">
          <CurrentGovernanceStage
            title={governanceCalendar.title}
            endDate={governanceCalendar.endDate}
            reviewPeriod={governanceCalendar.reviewPeriod}
          />
        </div>
      )}
      <section
        className={cn("mt-4", governanceCalendar && "mt-0")}
        key={activeTab}
      >
        {activeTab === ProposalListTab.ALL && allProposalsListElement}
        {activeTab === ProposalListTab.DRAFT && draftProposalsListElement}
        {activeTab === ProposalListTab.MY_DRAFTS && myDraftProposalsListElement}
      </section>
    </div>
  );
};

export const ProposalListContainerSkeleton = () => {
  return (
    <div>
      <div className="flex flex-col max-w-[76rem]">
        <div className="flex flex-col sm:flex-row justify-between items-baseline gap-2 mb-2 sm:mb-auto">
          <div className="flex flex-col sm:flex-row justify-between gap-4 w-full items-center mt-6 sm:mt-0">
            <div className="flex flex-row space-x-4">
              <button
                type="button"
                className="sm:text-xl mb-0 text-primary border-b-2 border-primary"
                onClick={() => {}}
              >
                Proposals
              </button>
              <button
                type="button"
                className="sm:text-xl mb-0 flex flex-row gap-2 items-center text-primary/40 hover:text-primary/80 transition-colors"
                onClick={() => {}}
              >
                <span>Submissions</span>
              </button>
              <button
                type="button"
                className="sm:text-xl mb-0 flex flex-row gap-2 items-center text-primary/40 hover:text-primary/80 transition-colors"
                onClick={() => {}}
              >
                Drafts
              </button>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-4 items-center flex-1 w-full sm:w-fit">
              <span></span>
            </div>
          </div>
        </div>

        <section className="mt-4">
          <div className="flex flex-col justify-center py-8 text-center space-y-2 border border-line rounded-lg shadow-newDefault">
            <AgoraLoaderSmall />
            <span className="text-tertiary">Loading proposals</span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProposalListContainer;
