/*
 * TanStack Start port of src/app/proposals/sponsor/[id]/page.tsx.
 * URL: /proposals/sponsor/:id
 */

import { createFileRoute } from "@tanstack/react-router";

import Tenant from "@/lib/tenant/tenant";
import { icons } from "@/icons/icons";
import SponsorForm from "@/app/proposals/sponsor/components/SponsorForm";
import SponsorAuthCheck from "@/app/proposals/sponsor/components/SponsorAuthCheck";
import ENSName from "@/components/shared/ENSName";
import ArchivedDraftProposal from "@/app/proposals/draft/components/ArchivedDraftProposal";
import { isPostSubmission } from "@/app/proposals/draft/utils/stages";

export const Route = createFileRoute("/proposals/sponsor/$id")({
  head: () => {
    const { brandName } = Tenant.current();
    return {
      meta: [
        { title: `Sponsor Proposal | ${brandName}` },
        {
          name: "description",
          content: `Review and sponsor a ${brandName} governance proposal draft.`,
        },
      ],
    };
  },
  loader: async ({ params }) => {
    const { prismaWeb2Client } = await import("@/app/lib/prisma");
    const draftProposal = await prismaWeb2Client.proposalDraft.findUnique({
      where: { uuid: params.id },
      include: {
        transactions: { orderBy: { order: "asc" } },
        social_options: true,
        checklist_items: true,
        approval_options: {
          include: { transactions: { orderBy: { order: "asc" } } },
        },
      },
    });
    return { draftProposal };
  },
  component: function SponsorPage() {
    const { draftProposal } = Route.useLoaderData();

    if (!draftProposal) {
      return <div>Draft proposal not found.</div>;
    }

    const isPostSubmissionStage = isPostSubmission(draftProposal.stage);

    if (isPostSubmissionStage) {
      return <ArchivedDraftProposal draftProposal={draftProposal as never} />;
    }

    return (
      <SponsorAuthCheck sponsorAddress={draftProposal.sponsor_address!}>
        <main className="max-w-screen-xl mx-auto mt-10">
          <div className="grid grid-cols-3 gap-12">
            <div className="col-span-2">
              <SponsorForm draftProposal={draftProposal as never} />
            </div>
            <div className="self-start">
              <div className="border bg-[#FAFAF2] border-[#ECE3CA] text-[#B16B19] p-6 rounded-lg">
                <div className="flex flex-row items-center space-x-4">
                  <img
                    className="border bg-[#FAFAF2] border-[#ECE3CA] rounded-md p-2 shadow-newDefault"
                    src={icons.sponsor}
                    alt="Sponsor"
                    width={42}
                    height={42}
                  />
                  <p className="font-semibold text-primary">
                    <ENSName address={draftProposal.author_address} /> would
                    like your help to submit this proposal
                  </p>
                </div>
                <p className="text-[#B16B19]/70 mt-2">
                  The proposer has created a draft proposal, but might not meet
                  the proposal threshold to submit it themselves.
                </p>
                <p className="text-[#B16B19]/70 mt-2">
                  If you choose to do so, this proposal will be marked as
                  submitted by{" "}
                  <span className="text-primary">
                    <ENSName address={draftProposal.sponsor_address || ""} />
                  </span>
                  , authored by{" "}
                  <span className="text-primary">
                    <ENSName address={draftProposal.author_address} />
                  </span>
                </p>
              </div>
            </div>
          </div>
        </main>
      </SponsorAuthCheck>
    );
  },
});
