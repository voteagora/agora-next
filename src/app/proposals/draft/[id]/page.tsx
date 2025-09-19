export const dynamic = "force-dynamic";

import Tenant from "@/lib/tenant/tenant";
import DraftProposalPageClient from "./DraftProposalPageClient";
import { permanentRedirect } from "next/navigation";
import BackButton from "../components/BackButton";
import {
  GET_DRAFT_STAGES,
  getStageMetadata,
  isPostSubmission,
} from "../utils/stages";
import OnlyOwner from "./components/OwnerOnly";
import ArchivedDraftProposal from "../components/ArchivedDraftProposal";
import DeleteDraftButton from "../components/DeleteDraftButton";
import ReactMarkdown from "react-markdown";
import { fetchDraftProposal } from "@/app/api/common/draftProposals/getDraftProposals";
import { fetchProposalTypes } from "@/app/api/common/proposals/getProposals";
import { PLMConfig } from "@/app/proposals/draft/types";

export const maxDuration = 120;

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

  // Canonicalize URL: if numeric id is used, redirect permanently to UUID, preserving all query params
  const numericId = Number(params.id);
  const isNumericParam = !isNaN(numericId);
  if (isNumericParam) {
    const draftById = await fetchDraftProposal(numericId);
    if (draftById?.uuid) {
      const entries = Object.entries(searchParams || {}).flatMap(
        ([key, value]) =>
          Array.isArray(value)
            ? value.map((v) => [key, String(v)] as [string, string])
            : value !== undefined
              ? [[key, String(value)] as [string, string]]
              : []
      );
      const qs = new URLSearchParams(entries).toString();
      const target = `/proposals/draft/${draftById.uuid}${qs ? `?${qs}` : ""}`;
      return permanentRedirect(target);
    }
  }

  const proposalTypes = await fetchProposalTypes();

  return (
    <DraftProposalPageClient
      idParam={params.id}
      searchParams={searchParams}
      proposalTypes={proposalTypes}
    />
  );
}
