import Hero from "@/components/Hero/Hero";
import Tenant from "@/lib/tenant/tenant";
import SubscribeDialogLauncher from "@/components/Notifications/SubscribeDialogRootLauncher";
import ProposalListContainer from "@/components/Proposals/ProposalsList/ProposalListContainer";
import DraftProposalList from "@/components/Proposals/ProposalsList/DraftProposalList";
import MyDraftProposalList from "@/components/Proposals/ProposalsList/MyDraftProposalList";
import AllProposalList from "@/components/Proposals/ProposalsList/AllProposalList";
import { Suspense } from "react";

export default async function ProposalsHome() {
  const { ui } = Tenant.current();

  if (!ui.toggle("proposals")) {
    return <div>Route not supported for namespace</div>;
  }

  const supportsNotifications = ui.toggle("email-subscriptions")?.enabled;

  return (
    <div className="flex flex-col">
      {supportsNotifications && <SubscribeDialogLauncher />}
      <Hero page="proposals" />
      <Suspense fallback={<div>Loading...</div>}>
        <ProposalListContainer
          allProposalsListElement={<AllProposalList />}
          draftProposalsListElement={<DraftProposalList />}
          myDraftProposalsListElement={<MyDraftProposalList />}
        />
      </Suspense>
    </div>
  );
}
