import Tenant from "@/lib/tenant/tenant";
import DraftProposalForm from "../components/DraftProposalForm";
import { GET_DRAFT_STAGES, isPostSubmission } from "../utils/stages";
import ReactMarkdown from "react-markdown";
import { fetchDraftProposal } from "@/app/api/common/draftProposals/getDraftProposals";
import { fetchProposalTypes } from "@/app/api/common/proposals/getProposals";
import { PLMConfig } from "@/app/proposals/draft/types";
import { getConnectedAccountFromCookies } from "@/lib/wagmi";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const RightColumn = () => {
  const { ui } = Tenant.current();
  const proposalLifecycleToggle = ui.toggle("proposal-lifecycle");

  return (
    <Accordion type="single" collapsible className="">
      {(proposalLifecycleToggle?.config as PLMConfig)?.copy.draftSteps.map(
        (step: any, index: any) => (
          <AccordionItem value={`item-${index + 1}`}>
            <AccordionTrigger className="flex items-center gap-2">
              <span className="text-primary font-bold bg-tertiary/5 rounded-full text-sm border border-line h-[30px] w-[30px] flex items-center justify-center">
                {index + 1}
              </span>
              <span className="text-primary">{step.title}</span>
            </AccordionTrigger>
            <AccordionContent>
              <ReactMarkdown className="prose-a:text-primary prose-a:underline">
                {step.description}
              </ReactMarkdown>
            </AccordionContent>
          </AccordionItem>
        )
      )}
    </Accordion>
  );
};
export default async function DraftProposalPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const { ui, slug } = Tenant.current();
  const connectedAccount = getConnectedAccountFromCookies();
  const proposalLifecycleToggle = ui.toggle("proposal-lifecycle");
  const tenantSupportsProposalLifecycle = proposalLifecycleToggle?.enabled;

  if (!tenantSupportsProposalLifecycle) {
    return <div>This feature is not supported by this tenant.</div>;
  }

  const [draftProposal, proposalTypes] = await Promise.all([
    fetchDraftProposal(parseInt(params.id), slug),
    fetchProposalTypes(),
  ]);

  const DRAFT_STAGES_FOR_TENANT = GET_DRAFT_STAGES()!;
  const stageParam = (searchParams?.stage || "0") as string;
  const stageIndex = parseInt(stageParam, 10);
  const stageObject = DRAFT_STAGES_FOR_TENANT[stageIndex];

  if (!draftProposal) {
    return (
      <div className="bg-tertiary/5 rounded-lg p-4 border border-line mt-12 flex flex-col items-center justify-center text-secondary h-[calc(100vh-15rem)]">
        <h1 className="text-primary text-2xl font-bold">Error</h1>
        <p className="text-secondary mt-2">Submission not found.</p>
      </div>
    );
  }

  if (isPostSubmission(draftProposal.stage)) {
    return (
      <div className="bg-tertiary/5 rounded-lg p-4 border border-line mt-12 flex flex-col items-center justify-center text-secondary h-[calc(100vh-15rem)]">
        <h1 className="text-primary text-2xl font-bold">Error</h1>
        <p className="text-secondary mt-2">
          This proposal has been published onchain.
        </p>
      </div>
    );
  }

  if (draftProposal.author_address !== connectedAccount) {
    return (
      <div className="bg-tertiary/5 rounded-lg p-4 border border-line mt-12 flex flex-col items-center justify-center text-secondary h-[calc(100vh-15rem)]">
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
