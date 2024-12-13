import prisma from "@/app/lib/prisma";
import { DraftProposal } from "../../../proposals/draft/types";
import SponsorActionPanel from "../components/SponsorActionPanel";
import { ProposalType, BasicProposal } from "@/app/proposals/draft/types";
import ProposalTransactionDisplay from "@/components/Proposals/ProposalPage/ApprovedTransactions/ProposalTransactionDisplay";
import {
  ProposalDraftApprovedSponsors,
  ProposalDraftComment,
  DaoSlug,
} from "@prisma/client";
import MobileSponsorActionPanel from "./MobileSponsorActionPanel";
import CommentPanel from "./CommentPanel";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { proposalTypeDescriptionMap } from "@/app/proposals/draft/types";
import SponsorActionTab from "./SponsorActionTab";
import Tenant from "@/lib/tenant/tenant";
import { isPostSubmission } from "@/app/proposals/draft/utils/stages";

const getDraftProposal = async (id: number, slug: DaoSlug) => {
  const draftProposal = await prisma.proposalDraft.findUnique({
    where: {
      id: id,
      dao_slug: slug,
    },
    include: {
      transactions: true,
      social_options: true,
      checklist_items: true,
      approved_sponsors: true,
      comments: true,
      approval_options: {
        include: {
          transactions: true,
        },
      },
    },
  });

  return draftProposal as DraftProposal & {
    approved_sponsors: ProposalDraftApprovedSponsors[];
    comments: ProposalDraftComment[];
  };
};

const ProposalSponsorPage = async ({ params }: { params: { id: string } }) => {
  const { slug } = await Tenant.current();
  const draftProposal = await getDraftProposal(parseInt(params.id), slug);

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

  return (
    <main className="max-w-screen-xl mx-auto mt-12">
      <div className="flex flex-row items-end justify-between">
        <div className="flex flex-row items-center gap-4">
          <Link
            className="cursor-pointer border border-agora-stone-100 bg-neutral rounded-full p-1 w-8 h-8 flex items-center justify-center shadow-newDefault"
            href={`/`}
          >
            <ChevronLeftIcon className="h-6 w-6 text-secondary" />
          </Link>
          <h1 className="font-bold text-2xl text-primary">
            {draftProposal.title}
          </h1>
        </div>
        <SponsorActionTab draftProposal={draftProposal} />
      </div>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="col-span-1 sm:col-span-2">
          <div className="border border-line rounded-lg p-4 bg-neutral">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex flex-row space-x-1 items-center mb-4">
                  <span className="font-medium capitalize">
                    {draftProposal.voting_module_type} proposal
                  </span>
                  <InformationCircleIcon className="h-4 w-4 text-secondary" />
                </TooltipTrigger>
                <TooltipContent
                  className="text-sm max-w-[250px]"
                  side="bottom"
                  align="start"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium capitalize">
                      {draftProposal.voting_module_type} proposal
                    </span>
                    <span className="text-secondary text-xs">
                      {
                        proposalTypeDescriptionMap[
                          draftProposal.voting_module_type
                        ]
                      }
                    </span>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {draftProposal.voting_module_type === ProposalType.BASIC && (
              <ProposalTransactionDisplay
                descriptions={(draftProposal as BasicProposal).transactions.map(
                  (t) => t.description
                )}
                targets={(draftProposal as BasicProposal).transactions.map(
                  (t) => t.target
                )}
                calldatas={
                  (draftProposal as BasicProposal).transactions.map(
                    (t) => t.calldata
                  ) as `0x${string}`[]
                }
                values={(draftProposal as BasicProposal).transactions.map(
                  (t) => t.value
                )}
                simulationDetails={{
                  id: (draftProposal as BasicProposal).transactions[0]
                    ?.simulation_id,
                  state: (draftProposal as BasicProposal).transactions[0]
                    ?.simulation_state,
                }}
              />
            )}
            <p className="prose mt-6">{draftProposal.abstract}</p>
          </div>

          {/* Comments are coming in the next phase */}
          {/* <CommentPanel
            comments={draftProposal.comments}
            params={{ id: params.id }}
          /> */}
        </div>
        <div className="self-start hidden sm:block sticky top-6">
          <SponsorActionPanel draftProposal={draftProposal} />
        </div>
        <MobileSponsorActionPanel draftProposal={draftProposal} />
      </div>
    </main>
  );
};

export default ProposalSponsorPage;
