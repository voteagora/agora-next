import Hero from "@/components/Hero/Hero";
import Tenant from "@/lib/tenant/tenant";
import { fetchGovernanceCalendar as apiFetchGovernanceCalendar } from "@/app/api/common/governanceCalendar/getGovernanceCalendar";
import SubscribeDialogLauncher from "@/components/Notifications/SubscribeDialogRootLauncher";
import ProposalListContainer from "@/components/Proposals/ProposalsList/ProposalListContainer";
import DraftProposalList from "@/components/Proposals/ProposalsList/DraftProposalList";
import MyDraftProposalList from "@/components/Proposals/ProposalsList/MyDraftProposalList";
import AllProposalList from "@/components/Proposals/ProposalsList/AllProposalList";
import CurrentGovernanceStage from "@/components/Proposals/CurrentGovernanceStage/CurrentGovernanceStage";
import { Suspense } from "react";

async function fetchGovernanceCalendar() {
  "use server";
  return apiFetchGovernanceCalendar();
}

export default async function ProposalsHome() {
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
      <Suspense fallback={<div>Loading...</div>}>
        {governanceCalendar && (
          <CurrentGovernanceStage
            title={governanceCalendar.title}
            endDate={governanceCalendar.endDate}
            reviewPeriod={governanceCalendar.reviewPeriod}
          />
        )}
        {/* TODO: needs my vote as filter to all proposals table? */}
        <ProposalListContainer
          allProposalsListElement={<AllProposalList />}
          draftProposalsListElement={<DraftProposalList />}
          myDraftProposalsListElement={<MyDraftProposalList />}
        />
      </Suspense>
    </div>
  );
}
