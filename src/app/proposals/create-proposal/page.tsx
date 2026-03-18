export const dynamic = "force-dynamic";

import Tenant from "@/lib/tenant/tenant";
import CreateProposalFormClient from "./CreateProposalFormClient";
import { fetchProposalTypes } from "@/app/api/common/proposals/getProposals";

export const maxDuration = 120;

export default async function CreateProposalPage() {
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
