import Hero from "@/components/Hero/Hero";
import Tenant from "@/lib/tenant/tenant";
import { fetchGovernanceCalendar as apiFetchGovernanceCalendar } from "@/app/api/common/governanceCalendar/getGovernanceCalendar";
import SubscribeDialogLauncher from "@/components/Notifications/SubscribeDialogRootLauncher";
import ProposalListContainer, {
  ProposalListContainerSkeleton,
} from "@/components/Proposals/ProposalsList/ProposalListContainer";
import DraftProposalList from "@/components/Proposals/ProposalsList/DraftProposalList";
import AllProposalList from "@/components/Proposals/ProposalsList/AllProposalList";
import MyDraftProposalListServer from "@/components/Proposals/ProposalsList/MyDraftProposalListServer";
import { Suspense } from "react";

async function fetchGovernanceCalendar() {
  "use server";
  return apiFetchGovernanceCalendar();
}

export default async function ProposalsHome({
  searchParams,
}: {
  searchParams: { filter?: string; sort?: string };
}) {
  const { ui } = Tenant.current();
  if (!ui.toggle("proposals")) {
    return <div>Route not supported for namespace</div>;
  }

  const supportsNotifications = ui.toggle("email-subscriptions")?.enabled;
  const governanceCalendar = await fetchGovernanceCalendar();

  return (
    <div className="flex flex-col">
      {supportsNotifications && <SubscribeDialogLauncher />}
      <Hero page="proposals" />
      <Suspense fallback={<ProposalListContainerSkeleton />}>
        {/* TODO: needs my vote as filter to all proposals table? */}
        <ProposalListContainer
          allProposalsListElement={
            <AllProposalList searchParams={searchParams} />
          }
          draftProposalsListElement={
            <DraftProposalList searchParams={searchParams} />
          }
          myDraftProposalsListElement={
            <MyDraftProposalListServer searchParams={searchParams} />
          }
          governanceCalendar={governanceCalendar}
        />
      </Suspense>
    </div>
  );
}
