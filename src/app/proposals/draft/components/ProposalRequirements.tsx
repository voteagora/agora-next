import { formatUnits } from "viem";
import { PLMConfig, ProposalGatingType } from "@/app/proposals/draft/types";
import { ProposalType } from "@/app/proposals/draft/types";
import Tenant from "@/lib/tenant/tenant";
import { useManager } from "@/hooks/useManager";
import { useProposalThreshold } from "@/hooks/useProposalThreshold";
import { DraftProposal } from "@/app/proposals/draft/types";
import { truncateAddress } from "@/app/lib/utils/text";

const ProposalRequirements = ({
  proposalDraft,
}: {
  proposalDraft: DraftProposal;
}) => {
  const tenant = Tenant.current();
  const plmToggle = tenant.ui.toggle("proposal-lifecycle");
  const gatingType = (plmToggle?.config as PLMConfig)?.gatingType;
  const votingModuleType = proposalDraft.voting_module_type;

  const { data: threshold } = useProposalThreshold();
  const { data: manager } = useManager();

  const renderProposalRequirements = () => {
    if (votingModuleType === ProposalType.SOCIAL) {
      return (
        <div className="first-of-type:rounded-t-xl first-of-type:border-t border-x border-b border-line last-of-type:rounded-b-xl px-4 py-3 flex flex-row items-center space-x-4">
          <p className="flex-grow">Token balance</p>
          <span className="text-secondary font-mono text-xs">
            {"> "}
            {(plmToggle?.config as PLMConfig)?.snapshotConfig?.requiredTokens}
            {" tokens"}
          </span>
        </div>
      );
    }

    if (
      gatingType === ProposalGatingType.MANAGER ||
      gatingType === ProposalGatingType.GOVERNOR_V1
    ) {
      return (
        <div className="first-of-type:rounded-t-xl first-of-type:border-t border-x border-b border-line last-of-type:rounded-b-xl px-4 py-3 flex flex-row items-center space-x-4">
          <p className="flex-grow">Manager address</p>
          <span className="text-secondary font-mono text-xs">
            {truncateAddress(manager?.toString() ?? "", 6)}
          </span>
        </div>
      );
    }

    if (
      gatingType === ProposalGatingType.TOKEN_THRESHOLD ||
      gatingType === ProposalGatingType.GOVERNOR_V1
    ) {
      return (
        <div className="first-of-type:rounded-t-xl first-of-type:border-t border-x border-b border-line last-of-type:rounded-b-xl px-4 py-3 flex flex-row items-center space-x-4">
          <p className="flex-grow">Token balance</p>
          <span className="text-secondary font-mono text-xs">
            {"> "}
            {threshold
              ? Math.round(
                  parseFloat(
                    formatUnits(BigInt(threshold), tenant.token.decimals)
                  )
                )
              : "0"}{" "}
            tokens
          </span>
        </div>
      );
    }

    return null;
  };
  return <>{renderProposalRequirements()}</>;
};

export default ProposalRequirements;
