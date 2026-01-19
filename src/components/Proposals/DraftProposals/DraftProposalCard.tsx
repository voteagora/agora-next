import { ProposalDraft } from "@prisma/client";
import { getStageMetadata } from "@/app/proposals/draft/utils/stages";
import Tenant from "@/lib/tenant/tenant";
import DeleteDraftButton from "@/app/proposals/draft/components/DeleteDraftButton";

const DraftProposalCard = ({
  proposal,
  showDelete = false,
  onDeleteSuccess,
}: {
  proposal: ProposalDraft;
  showDelete?: boolean;
  onDeleteSuccess?: () => void;
}) => {
  const tenant = Tenant.current();
  const plmToggle = tenant.ui.toggle("proposal-lifecycle");

  if (!plmToggle) {
    throw new Error(
      `Proposal lifecycle toggle not found for tenant ${tenant.ui.title}`
    );
  }

  const currentStageMetadata = getStageMetadata(proposal.stage);

  return (
    <div className="flex flex-col sm:flex-row justify-between bg-neutral border border-line rounded-2xl px-6 py-5 shadow-sm">
        <div className="flex-1">
          <p className="font-semibold text-secondary text-xs">{`By ${proposal.author_address}`}</p>
          <p className="font-medium text-primary">
            {proposal.title || "[Title pending]"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-4 sm:mt-0">
          <div className="w-[140px]">
            <p className="font-semibold text-secondary text-xs">{`Status`}</p>
            <p className="font-medium text-primary">
              {currentStageMetadata.shortTitle}
            </p>
          </div>
          <div className="w-[140px]">
            <p className="font-semibold text-secondary text-xs">{`Type`}</p>
            <p className="font-medium text-primary">
              {proposal.voting_module_type || "[Type pending]"}
            </p>
          </div>
          <div className="w-[140px]">
            <p className="font-semibold text-secondary text-xs">{`Waiting for`}</p>
            <p className="font-medium text-primary">
              {currentStageMetadata.waitingFor}
            </p>
          </div>
        </div>
        {showDelete && (
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <DeleteDraftButton
              proposalId={proposal.id}
              onDeleteSuccess={onDeleteSuccess}
              small
            />
          </div>
        )}
    </div>
  );
};

export default DraftProposalCard;
