"use client";

import { useEffect, useMemo, useState } from "react";
import DraftPreview from "../DraftPreview";
import { useAccount, useBlockNumber } from "wagmi";
import RequestSponsorshipForm from "../RequestSponsorshipForm";
import { useForm, FormProvider } from "react-hook-form";
import SponsorActions from "../../../sponsor/components/SponsorActions";
import { useProposalThreshold } from "@/hooks/useProposalThreshold";
import { useManager } from "@/hooks/useManager";
import {
  DraftProposal,
  PLMConfig,
  ProposalGatingType,
  ProposalScope,
} from "../../types";
import Tenant from "@/lib/tenant/tenant";
import { useGetVotes } from "@/hooks/useGetVotes";
import { UpdateVotableSupplyOracle } from "@/app/proposals/components/UpdateVotableSupplyOracle";

const Actions = ({ proposalDraft }: { proposalDraft: DraftProposal }) => {
  const { ui, contracts, token } = Tenant.current();
  const plmToggle = ui.toggle("proposal-lifecycle");
  const offchainToggle = ui.toggle("proposals/offchain");
  const gatingType = (plmToggle?.config as PLMConfig)?.gatingType;

  // Get wallet data with stable references
  const { address } = useAccount();
  // Stabilize hook calls
  const { data: blockNumber } = useBlockNumber({
    chainId: ui.toggle("use-l1-block-number")?.enabled
      ? contracts.chainForTime?.id
      : undefined,
  });

  const { data: threshold } = useProposalThreshold();

  const { data: manager } = useManager();

  const [lastValidVotes, setLastValidVotes] = useState<bigint | undefined>(
    undefined
  );

  const { data: accountVotes } = useGetVotes({
    address: address as `0x${string}`,
    blockNumber: blockNumber ? blockNumber - BigInt(1) : BigInt(0),
    enabled: !!address,
  });

  // Update lastValidVotes when accountVotes changes and is defined
  useEffect(() => {
    if (accountVotes !== undefined) {
      setLastValidVotes(accountVotes);
    }
  }, [accountVotes]);

  // Use either the current votes or the last valid votes
  const stableAccountVotes =
    accountVotes !== undefined ? accountVotes : lastValidVotes;

  const canAddressSponsor = useMemo(() => {
    if (
      offchainToggle?.enabled &&
      ((proposalDraft.proposal_scope === ProposalScope.HYBRID &&
        !!proposalDraft.onchain_transaction_hash) ||
        proposalDraft.proposal_scope === ProposalScope.OFFCHAIN_ONLY)
    ) {
      return (
        address &&
        (plmToggle?.config as PLMConfig)?.offchainProposalCreator?.includes(
          address
        )
      );
    }
    switch (gatingType) {
      case ProposalGatingType.MANAGER:
        return manager === address;
      case ProposalGatingType.TOKEN_THRESHOLD:
        return stableAccountVotes !== undefined && threshold !== undefined
          ? stableAccountVotes >= threshold
          : false;
      case ProposalGatingType.GOVERNOR_V1:
        return (
          manager === address ||
          (stableAccountVotes !== undefined && threshold !== undefined
            ? stableAccountVotes >= threshold
            : false)
        );
      default:
        return false;
    }
  }, [gatingType, manager, address, stableAccountVotes, threshold]);
  return (
    <div className="mt-6">
      {contracts.votableSupplyOracle?.address && (
        <UpdateVotableSupplyOracle
          votableSupplyOracle={contracts.votableSupplyOracle}
          tokenDecimal={token.decimals}
        />
      )}
      {canAddressSponsor ? (
        <SponsorActions draftProposal={proposalDraft} />
      ) : (
        <RequestSponsorshipForm draftProposal={proposalDraft} />
      )}
    </div>
  );
};

const SubmitForm = ({ draftProposal }: { draftProposal: DraftProposal }) => {
  const methods = useForm({});
  return (
    <FormProvider {...methods}>
      <form>
        <DraftPreview
          proposalDraft={draftProposal}
          actions={<Actions proposalDraft={draftProposal} />}
        />
      </form>
    </FormProvider>
  );
};

export default SubmitForm;
