export const dynamic = "force-dynamic";

import Tenant from "@/lib/tenant/tenant";
import CreateProposalFormClient from "./CreateProposalFormClient";
import { fetchProposalTypes } from "@/app/api/common/proposals/getProposals";
import { ProposalCreateForm } from "@/components/vibdao/ProposalCreateForm";
import { UtilityNav } from "@/components/vibdao/UtilityNav";
import { getClientContracts } from "@/lib/vibdao/contracts";
import PageHeader from "@/components/Layout/PageHeader/PageHeader";

export const maxDuration = 120;

export default async function CreateProposalPage() {
  if (process.env.VIBDAO_LOCAL_MODE === "true") {
    const contracts = getClientContracts();

    return (
      <main className="max-w-[76rem] mx-auto mt-10 px-4 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <PageHeader headerText="Create Proposal" />
          <p className="text-secondary max-w-3xl">
            Local governance supports grant, add fellow, remove fellow, update
            salary, and minimum donation proposals.
          </p>
        </div>
        <UtilityNav />
        <div className="bg-neutral border border-line rounded-xl shadow-newDefault p-6">
          <ProposalCreateForm contracts={contracts} />
        </div>
      </main>
    );
  }

  const { ui } = Tenant.current();
  const proposalLifecycleToggle = ui.toggle("proposal-lifecycle");
  const tenantSupportsProposalLifecycle = proposalLifecycleToggle?.enabled;

  if (!tenantSupportsProposalLifecycle) {
    return <div>This feature is not supported by this tenant.</div>;
  }

  const proposalTypes = await fetchProposalTypes();

  return (
    <main className="max-w-screen-xl mx-auto mt-10">
      <CreateProposalFormClient proposalTypes={proposalTypes} />
    </main>
  );
}
