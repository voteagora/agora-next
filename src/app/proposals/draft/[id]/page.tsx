export const dynamic = "force-dynamic";

import Tenant from "@/lib/tenant/tenant";
import DraftProposalPageClient from "./DraftProposalPageClient";
import { fetchProposalTypes } from "@/app/api/common/proposals/getProposals";
import { PLMConfig } from "@/app/proposals/draft/types";
import { buildPageMetadata } from "@/app/lib/utils/metadata";

export const maxDuration = 120;

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { brandName } = Tenant.current();

  return buildPageMetadata({
    title: `Draft Proposal | ${brandName}`,
    description: `Review and edit a ${brandName} governance proposal draft.`,
    path: `/proposals/draft/${params.id}`,
    robots: {
      index: false,
      follow: false,
    },
  });
}

export default async function DraftProposalPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const { ui } = Tenant.current();
  const proposalLifecycleToggle = ui.toggle("proposal-lifecycle");
  const config = proposalLifecycleToggle?.config as PLMConfig;
  const tenantSupportsProposalLifecycle = proposalLifecycleToggle?.enabled;

  if (!tenantSupportsProposalLifecycle) {
    return <div>This feature is not supported by this tenant.</div>;
  }

  // UUID-only: load by UUID; numeric IDs are not redirected nor resolved
  const proposalTypes = await fetchProposalTypes();

  return (
    <DraftProposalPageClient
      idParam={params.id}
      searchParams={searchParams}
      proposalTypes={proposalTypes}
    />
  );
}
