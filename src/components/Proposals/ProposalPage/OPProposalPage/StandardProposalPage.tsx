import ProposalDescription from "../ProposalDescription/ProposalDescription";
import { Proposal } from "@/app/api/common/proposals/proposal";
import ProposalVotesCard from "./ProposalVotesCard/ProposalVotesCard";
import { ProposalStateAdmin } from "@/app/proposals/components/ProposalStateAdmin";

export default async function StandardProposalPage({
  proposal,
}: {
  proposal: Proposal;
}) {
  return (
    <div className="flex flex-col">
      <ProposalStateAdmin proposal={proposal} />
      <div className="flex gap-16 justify-between items-start max-w-[76rem] flex-col sm:flex-row sm:items-start sm:justify-between">
        <ProposalDescription proposal={proposal} />
        <div>
          <ProposalVotesCard proposal={proposal} />
        </div>
      </div>
    </div>
  );
}
