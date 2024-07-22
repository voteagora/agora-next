"use client";

import { useState } from "react";
import { UpdatedButton } from "@/components/Button";
import { getInputData } from "../../draft/utils/getInputData";
import Tenant from "@/lib/tenant/tenant";
import { createSnapshot } from "../../draft/utils/createSnapshot";
import { ProposalType } from "../../../proposals/draft/types";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { useAccount } from "wagmi";
import {
  ProposalDraft,
  ProposalDraftTransaction,
  ProposalSocialOption,
} from "@prisma/client";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { onSubmitAction as sponsorDraftProposal } from "../../draft/actions/sponsorDraftProposal";

const SponsorActions = ({
  draftProposal,
}: {
  draftProposal: ProposalDraft & {
    transactions: ProposalDraftTransaction[];
    social_options: ProposalSocialOption[];
  };
}) => {
  const tenant = Tenant.current();
  const plmToggle = tenant.ui.toggle("proposal-lifecycle");
  const { contracts, isProd } = Tenant.current();
  const [isSnapshotPending, setIsSnapshotPending] = useState<boolean>(false);
  const openDialog = useOpenDialog();
  const { address } = useAccount();
  const { inputData } = getInputData(draftProposal);

  // TODO: needs to be configured to use the correct governor
  const { config } = usePrepareContractWrite({
    address: contracts.governor.address as `0x${string}`,
    chainId: contracts.governor.chain.id,
    abi: contracts.governor.abi,
    functionName: "propose",
    args: inputData,
  });

  const { writeAsync, isLoading: isWriteLoading } = useContractWrite(config);

  return (
    <div className="mt-6">
      <UpdatedButton
        isLoading={isWriteLoading || isSnapshotPending}
        fullWidth={true}
        type="primary"
        onClick={async () => {
          try {
            if (draftProposal.proposal_type === ProposalType.SOCIAL) {
              setIsSnapshotPending(true);
              const proposalId = await createSnapshot({
                address: address as `0x${string}`,
                proposal: draftProposal,
              });

              // TODO: make snapshot pull from config
              const snapshotLink = isProd
                ? `https://snapshot.org/#/${plmToggle?.config?.snapshotConfig?.domain}/proposal/${proposalId}`
                : `https://testnet.snapshot.org/#/michaelagora.eth/proposal/${proposalId}`;

              await sponsorDraftProposal({
                draftProposalId: draftProposal.id,
                snapshot_link: snapshotLink,
              });

              setIsSnapshotPending(false);
              openDialog({
                type: "SPONSOR_SNAPSHOT_DRAFT_PROPOSAL",
                params: { redirectUrl: "/", snapshotLink },
              });
            } else {
              const data = await writeAsync?.();
              await sponsorDraftProposal({
                draftProposalId: draftProposal.id,
                onchain_transaction_hash: data?.hash,
              });

              openDialog({
                type: "SPONSOR_ONCHAIN_DRAFT_PROPOSAL",
                params: {
                  redirectUrl: "/",
                  txHash: data?.hash as `0x${string}`,
                },
              });
            }
          } catch (error) {}
        }}
      >
        Submit proposal
      </UpdatedButton>
    </div>
  );
};

export default SponsorActions;
