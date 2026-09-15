export const dynamic = "force-dynamic";

import Tenant from "@/lib/tenant/tenant";
import CreateProposalFormClient from "./CreateProposalFormClient";
import { fetchProposalTypes } from "@/app/api/common/proposals/getProposals";
import { buildPageMetadata } from "@/app/lib/utils/metadata";

export const maxDuration = 120;

export async function generateMetadata() {
  const { brandName, ui } = Tenant.current();
  const proposalLabel = ui.copy.nouns.governanceProposal;

  return buildPageMetadata({
    title: `Create Proposal | ${brandName}`,
    description: `Create a ${proposalLabel} for ${brandName}.`,
    path: "/proposals/create-proposal",
    robots: {
      index: false,
      follow: false,
    },
  });
}

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
