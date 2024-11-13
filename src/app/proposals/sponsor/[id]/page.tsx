import prisma from "@/app/lib/prisma";
import SponsorAuthCheck from "../components/SponsorAuthCheck";
import ArchivedDraftProposal from "../../draft/components/ArchivedDraftProposal";
import { DraftProposal } from "../../../proposals/draft/types";
import SponsorActionPanel from "../components/SponsorActionPanel";
import { ProposalType, BasicProposal } from "@/app/proposals/draft/types";
import ProposalTransactionDisplay from "@/components/Proposals/ProposalPage/ApprovedTransactions/ProposalTransactionDisplay";
import { ProposalDraftApprovedSponsors } from "@prisma/client";

const getDraftProposal = async (id: number) => {
  const draftProposal = await prisma.proposalDraft.findUnique({
    where: {
      id: id,
    },
    include: {
      transactions: true,
      social_options: true,
      checklist_items: true,
      approved_sponsors: true,
      approval_options: {
        include: {
          transactions: true,
        },
      },
    },
  });

  return draftProposal as DraftProposal & {
    approved_sponsors: ProposalDraftApprovedSponsors[];
  };
};

const ProposalSponsorPage = async ({ params }: { params: { id: string } }) => {
  const draftProposal = await getDraftProposal(parseInt(params.id));

  // implies that the proposal has been sponsored, and the sponsor view is archived
  if (!!draftProposal.sponsor_address) {
    return <ArchivedDraftProposal draftProposal={draftProposal} />;
  }

  return (
    <SponsorAuthCheck
      sponsorAddresses={draftProposal.approved_sponsors.map(
        (s) => s.sponsor_address as `0x${string}`
      )}
    >
      <main className="max-w-screen-xl mx-auto mt-12">
        <div className="grid grid-cols-3 gap-12">
          <div className="col-span-2">
            <h1 className="font-black text-2xl text-primary mt-6">
              {draftProposal.title}
            </h1>
            <div className="mt-6">
              {draftProposal.voting_module_type === ProposalType.BASIC && (
                <ProposalTransactionDisplay
                  descriptions={(
                    draftProposal as BasicProposal
                  ).transactions.map((t) => t.description)}
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
            </div>
            <p className="prose mt-6">{draftProposal.abstract}</p>
          </div>
          <div className="self-start">
            <SponsorActionPanel draftProposal={draftProposal} />
          </div>
        </div>
      </main>
    </SponsorAuthCheck>
  );
};

export default ProposalSponsorPage;
