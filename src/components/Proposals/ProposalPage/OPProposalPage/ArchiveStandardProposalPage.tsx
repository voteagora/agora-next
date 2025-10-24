import ProposalDescription from "../ProposalDescription/ProposalDescription";
import { Proposal } from "@/app/api/common/proposals/proposal";
import ArchiveProposalVotesCard from "./ArchiveProposalVotesCard";

export default function ArchiveStandardProposalPage({
  proposal,
}: {
  proposal: Proposal;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex gap-0 md:gap-16 justify-between items-start max-w-[76rem] flex-col md:flex-row md:items-start md:justify-between">
        <div className="w-full proposal-description pb-8 md:pb-0">
          <ProposalDescription proposal={proposal} />
        </div>
        <div className="w-full md:max-w-[24rem]">
          <ArchiveProposalVotesCard proposal={proposal} />
        </div>
      </div>
      <div className="block md:hidden" style={{ height: 65 }} />
    </div>
  );
}
