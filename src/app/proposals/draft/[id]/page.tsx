import Tenant from "@/lib/tenant/tenant";
import DraftProposalForm from "../components/DraftProposalForm";
import { GET_DRAFT_STAGES } from "../utils/stages";
import ReactMarkdown from "react-markdown";
import { fetchDraftProposal } from "@/app/api/common/draftProposals/getDraftProposals";
import { fetchProposalTypes } from "@/app/api/common/proposals/getProposals";
import { PLMConfig } from "@/app/proposals/draft/types";
import { getConnectedAccountFromCookies } from "@/lib/wagmi";

const RightColumn = () => {
  const { ui } = Tenant.current();
  const proposalLifecycleToggle = ui.toggle("proposal-lifecycle");

  return (
    <ReactMarkdown className="prose-h2:text-lg prose-h2:font-bold prose-h2:text-primary prose-p:text-secondary prose-p:mt-2 prose-li:list-inside prose-li:list-disc prose-li:my-2">
      {(proposalLifecycleToggle?.config as PLMConfig)?.copy.helperText}
    </ReactMarkdown>
  );
};
export default async function DraftProposalPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const { ui } = Tenant.current();
  const connectedAccount = getConnectedAccountFromCookies();
  const proposalLifecycleToggle = ui.toggle("proposal-lifecycle");
  const tenantSupportsProposalLifecycle = proposalLifecycleToggle?.enabled;

  if (!tenantSupportsProposalLifecycle) {
    return <div>This feature is not supported by this tenant.</div>;
  }

  const [draftProposal, proposalTypes] = await Promise.all([
    fetchDraftProposal(parseInt(params.id)),
    fetchProposalTypes(),
  ]);

  // implies that the proposal has been sponsored, and the sponsor view is archived
  if (!!draftProposal.sponsor_address) {
    // GO TO LIVE PROPOSAL!
    return <div>Go to live proposal</div>;
  }

  const DRAFT_STAGES_FOR_TENANT = GET_DRAFT_STAGES()!;
  const stageParam = (searchParams?.stage || "0") as string;
  const stageIndex = parseInt(stageParam, 10);
  const stageObject = DRAFT_STAGES_FOR_TENANT[stageIndex];

  if (draftProposal.author_address !== connectedAccount) {
    return (
      <div className="bg-tertiary/5 rounded-lg p-4 border border-line mt-10 flex flex-col items-center justify-center text-secondary h-[calc(100vh-15rem)]">
        <h1 className="text-primary text-2xl font-bold">Unauthorized</h1>
        <p className="text-secondary mt-2">
          Only the creator of this draft submission can edit.
        </p>
      </div>
    );
  }

  return (
    <DraftProposalForm
      proposalTypes={proposalTypes}
      stage={stageObject.stage}
      draftProposal={draftProposal}
      rightColumn={<RightColumn />}
    />
  );
}
