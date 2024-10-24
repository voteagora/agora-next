import prisma from "@/app/lib/prisma";
import SponsorForm from "../components/SponsorForm";
import Image from "next/image";
import { icons } from "@/icons/icons";
import SponsorAuthCheck from "../components/SponsorAuthCheck";
import ENSName from "@/components/shared/ENSName";
import ArchivedDraftProposal from "../../draft/components/ArchivedDraftProposal";
import { DraftProposal } from "../../../proposals/draft/types";
import SponsorActionPanel from "../components/SponsorActionPanel";
import { ProposalType, BasicProposal } from "@/app/proposals/draft/types";
import ProposalTransactionDisplay from "@/components/Proposals/ProposalPage/ApprovedTransactions/ProposalTransactionDisplay";

const getDraftProposal = async (id: number) => {
  const draftProposal = await prisma.proposalDraft.findUnique({
    where: {
      id: id,
    },
    include: {
      transactions: true,
      social_options: true,
      checklist_items: true,
      approval_options: {
        include: {
          transactions: true,
        },
      },
    },
  });

  return draftProposal as DraftProposal;
};

const ProposalSponsorPage = async ({ params }: { params: { id: string } }) => {
  const draftProposal = await getDraftProposal(parseInt(params.id));

  // implies that the proposal has been sponsored, and the sponsor view is archived
  if (!!draftProposal.sponsor_address) {
    return <ArchivedDraftProposal draftProposal={draftProposal} />;
  }

  return (
    <main className="max-w-screen-xl mx-auto mt-12">
      {!draftProposal.is_public && (
        <div className="w-full p-2 border mb-6 rounded-lg flex flex-row bg-yellow-100 text-yellow-700 border-yellow-400">
          This is a private draft proposal.
        </div>
      )}
      <div className="grid grid-cols-3 gap-12">
        <div className="col-span-2">
          <h1 className="font-black text-2xl text-primary mt-6">
            {draftProposal.title}
          </h1>
          <div className="mt-6">
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
          </div>
          <p className="prose mt-6">{draftProposal.abstract}</p>
          {/* <SponsorForm draftProposal={draftProposal} /> */}
        </div>
        <div className="self-start">
          <SponsorActionPanel draftProposal={draftProposal} />
        </div>
      </div>
    </main>
  );

  //   return (
  //     <SponsorAuthCheck sponsorAddress={draftProposal.sponsor_address!}>
  //       <main className="max-w-screen-xl mx-auto mt-10">
  //         <div className="grid grid-cols-3 gap-12">
  //           <div className="col-span-2">
  //             <SponsorForm draftProposal={draftProposal} />
  //           </div>
  //           <div className="self-start">
  //             <div className="border bg-[#FAFAF2] border-[#ECE3CA] text-[#B16B19] p-6 rounded-lg">
  //               <div className="flex flex-row items-center space-x-4">
  //                 <Image
  //                   className="border bg-[#FAFAF2] border-[#ECE3CA] rounded-md p-2 shadow-newDefault"
  //                   src={icons.sponsor}
  //                   alt="Sponsor"
  //                   width={42}
  //                   height={42}
  //                 />

  //                 <p className="font-semibold">
  //                   <ENSName address={draftProposal.author_address} /> would like
  //                   your help to submit this proposal
  //                 </p>
  //               </div>
  //               <p className="text-[#B16B19]/70 mt-2">
  //                 The proposer has created a draft proposal, but might not meet
  //                 the proposal threshold to submit it themselves. They&apos;d like
  //                 you to help them submit it.
  //               </p>
  //               <p className="text-[#B16B19]/70 mt-2">
  //                 If you choose to do so, this proposal will be marked as
  //                 &apos;submitted by{" "}
  //                 <ENSName address={draftProposal.sponsor_address || ""} />,
  //                 authored by <ENSName address={draftProposal.author_address} />
  //                 &apos;
  //               </p>
  //             </div>
  //           </div>
  //         </div>
  //       </main>
  //     </SponsorAuthCheck>
  //   );
};

export default ProposalSponsorPage;
